<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExportService
{
    /**
     * Export data to Excel
     *
     * @param Builder $query The Eloquent query builder
     * @param array $fields Array of field names to export
     * @param array $options Additional options:
     *   - 'fieldMap' => array: Map of allowed fields (field => field)
     *   - 'transformers' => array: Custom transformers for specific fields (field => callable)
     *   - 'headings' => array: Custom headings (field => heading)
     *   - 'relationships' => array: Eager load relationships
     *   - 'filename' => string: Custom filename (without extension)
     *   - 'defaultFields' => array: Default fields if none selected
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public static function export(Builder $query, array $fields = [], array $options = [])
    {
        // Merge options with defaults
        $fieldMap = $options['fieldMap'] ?? [];
        $transformers = $options['transformers'] ?? [];
        $headings = $options['headings'] ?? [];
        $relationships = $options['relationships'] ?? [];
        $filename = $options['filename'] ?? 'export_' . now()->format('Y_m_d_H_i_s');
        $defaultFields = $options['defaultFields'] ?? [];

        // Validate and filter fields
        $validFields = [];
        if (!empty($fieldMap)) {
            foreach ($fields as $field) {
                if (isset($fieldMap[$field])) {
                    $validFields[] = $field;
                }
            }
        } else {
            $validFields = $fields;
        }

        // Use default fields if none selected
        if (empty($validFields) && !empty($defaultFields)) {
            $validFields = $defaultFields;
        }

        // Eager load relationships
        if (!empty($relationships)) {
            $query->with($relationships);
        }

        // Create export instance
        $export = new GenericExport($query, $validFields, [
            'transformers' => $transformers,
            'headings' => $headings,
        ]);

        return Excel::download($export, $filename . '.xlsx');
    }

    /**
     * Export collection data to Excel
     *
     * @param Collection $collection The collection of data to export
     * @param array $fields Array of field names to export
     * @param array $options Additional options:
     *   - 'fieldMap' => array: Map of allowed fields (field => field)
     *   - 'transformers' => array: Custom transformers for specific fields (field => callable)
     *   - 'headings' => array: Custom headings (field => heading)
     *   - 'filename' => string: Custom filename (without extension)
     *   - 'defaultFields' => array: Default fields if none selected
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public static function exportCollection(Collection $collection, array $fields = [], array $options = [])
    {
        // Merge options with defaults
        $fieldMap = $options['fieldMap'] ?? [];
        $transformers = $options['transformers'] ?? [];
        $headings = $options['headings'] ?? [];
        $filename = $options['filename'] ?? 'export_' . now()->format('Y_m_d_H_i_s');
        $defaultFields = $options['defaultFields'] ?? [];

        // Validate and filter fields
        $validFields = [];
        if (!empty($fieldMap)) {
            foreach ($fields as $field) {
                if (isset($fieldMap[$field])) {
                    $validFields[] = $field;
                }
            }
        } else {
            $validFields = $fields;
        }

        // Use default fields if none selected
        if (empty($validFields) && !empty($defaultFields)) {
            $validFields = $defaultFields;
        }

        // Create export instance
        $export = new GenericCollectionExport($collection, $validFields, [
            'transformers' => $transformers,
            'headings' => $headings,
        ]);

        return Excel::download($export, $filename . '.xlsx');
    }
}

/**
 * Generic Export Class
 */
class GenericExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $query;
    protected $fields;
    protected $transformers;
    protected $headings;

    public function __construct(Builder $query, array $fields, array $options = [])
    {
        $this->query = $query;
        $this->fields = $fields;
        $this->transformers = $options['transformers'] ?? [];
        $this->headings = $options['headings'] ?? [];
    }

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        $headings = [];
        foreach ($this->fields as $field) {
            if (isset($this->headings[$field])) {
                $headings[] = $this->headings[$field];
            } else {
                $headings[] = ucfirst(str_replace('_', ' ', $field));
            }
        }
        return $headings;
    }

    public function map($row): array
    {
        $data = [];
        foreach ($this->fields as $field) {
            // Check if there's a custom transformer
            if (isset($this->transformers[$field]) && is_callable($this->transformers[$field])) {
                $transformer = $this->transformers[$field];
                // Support both single parameter (row) and two parameters (row, field)
                $data[] = $transformer($row);
            } else {
                // Default: try to get the value
                $value = $this->getFieldValue($row, $field);
                $data[] = $value ?? '';
            }
        }
        return $data;
    }

    protected function getFieldValue($row, $field)
    {
        // Handle dot notation for relationships (e.g., 'formation.name')
        if (strpos($field, '.') !== false) {
            $parts = explode('.', $field);
            $value = $row;
            foreach ($parts as $part) {
                if (is_object($value) && isset($value->{$part})) {
                    $value = $value->{$part};
                } elseif (is_array($value) && isset($value[$part])) {
                    $value = $value[$part];
                } else {
                    return null;
                }
            }
            return $value;
        }

        // Direct property access
        if (is_object($row)) {
            return $row->{$field} ?? null;
        } elseif (is_array($row)) {
            return $row[$field] ?? null;
        }

        return null;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

/**
 * Generic Collection Export Class
 */
class GenericCollectionExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $collection;
    protected $fields;
    protected $transformers;
    protected $headings;

    public function __construct(Collection $collection, array $fields, array $options = [])
    {
        $this->collection = $collection;
        $this->fields = $fields;
        $this->transformers = $options['transformers'] ?? [];
        $this->headings = $options['headings'] ?? [];
    }

    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        $headings = [];
        foreach ($this->fields as $field) {
            if (isset($this->headings[$field])) {
                $headings[] = $this->headings[$field];
            } else {
                $headings[] = ucfirst(str_replace('_', ' ', $field));
            }
        }
        return $headings;
    }

    public function map($row): array
    {
        $data = [];
        foreach ($this->fields as $field) {
            // Check if there's a custom transformer
            if (isset($this->transformers[$field]) && is_callable($this->transformers[$field])) {
                $transformer = $this->transformers[$field];
                $data[] = $transformer($row);
            } else {
                // Default: try to get the value
                $value = $this->getFieldValue($row, $field);
                $data[] = $value ?? '';
            }
        }
        return $data;
    }

    protected function getFieldValue($row, $field)
    {
        // Handle dot notation for relationships
        if (strpos($field, '.') !== false) {
            $parts = explode('.', $field);
            $value = $row;
            foreach ($parts as $part) {
                if (is_object($value) && isset($value->{$part})) {
                    $value = $value->{$part};
                } elseif (is_array($value) && isset($value[$part])) {
                    $value = $value[$part];
                } else {
                    return null;
                }
            }
            return $value;
        }

        // Direct property access
        if (is_object($row)) {
            return $row->{$field} ?? null;
        } elseif (is_array($row)) {
            return $row[$field] ?? null;
        }

        return null;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

