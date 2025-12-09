# Quick Start: Using ExportService

## Simple Example

```php
use App\Services\ExportService;

public function export(Request $request)
{
    // 1. Build your query
    $query = YourModel::query();
    
    // 2. Apply any filters
    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }
    
    // 3. Get fields from request (comma-separated)
    $fields = array_filter(explode(',', $request->query('fields', 'name,email')));
    
    // 4. Export!
    return ExportService::export($query, $fields, [
        'filename' => 'my_export_' . now()->format('Y_m_d_H_i_s'),
    ]);
}
```

## With Field Validation

```php
return ExportService::export($query, $fields, [
    'fieldMap' => [
        'name' => 'name',
        'email' => 'email',
        'status' => 'status',
    ],
    'defaultFields' => ['name', 'email'],
    'filename' => 'export_' . now()->format('Y_m_d_H_i_s'),
]);
```

## With Custom Transformers

```php
return ExportService::export($query, $fields, [
    'transformers' => [
        'status' => function($row) {
            return $row->status ? 'Active' : 'Inactive';
        },
        'date' => function($row) {
            return $row->created_at->format('Y-m-d');
        },
    ],
    'filename' => 'export_' . now()->format('Y_m_d_H_i_s'),
]);
```

## With Relationships

```php
return ExportService::export($query, $fields, [
    'relationships' => ['user', 'category'],
    'transformers' => [
        'user_name' => function($row) {
            return $row->user->name ?? 'N/A';
        },
    ],
    'filename' => 'export_' . now()->format('Y_m_d_H_i_s'),
]);
```

## Complete Example (Reservations)

```php
// In ReservationsController.php
use App\Services\ExportService;

public function export(Request $request)
{
    $query = Reservation::query();
    
    // Filters
    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }
    
    $fields = array_filter(explode(',', $request->query('fields', 'user_name,date')));
    
    return ExportService::export($query, $fields, [
        'fieldMap' => [
            'user_name' => 'user_name',
            'date' => 'date',
            'type' => 'type',
        ],
        'defaultFields' => ['user_name', 'date'],
        'relationships' => ['user'],
        'filename' => 'reservations_' . now()->format('Y_m_d_H_i_s'),
        'transformers' => [
            'user_name' => function($reservation) {
                return $reservation->user->name ?? 'N/A';
            },
        ],
    ]);
}
```

