# ExportService Usage Examples

The `ExportService` is a reusable service for exporting data to Excel files. You can use it in any controller.

## Basic Usage

```php
use App\Services\ExportService;

public function export(Request $request)
{
    $query = YourModel::query();
    
    // Apply filters
    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }
    
    // Get fields from request
    $fields = explode(',', $request->query('fields', 'name,email'));
    
    return ExportService::export($query, $fields, [
        'filename' => 'my_export_' . now()->format('Y_m_d_H_i_s'),
    ]);
}
```

## Advanced Usage with Custom Transformers

```php
use App\Services\ExportService;

public function export(Request $request)
{
    $query = Reservation::query();
    
    // Get fields
    $fields = explode(',', $request->query('fields', 'user_name,date,start,end'));
    
    return ExportService::export($query, $fields, [
        'fieldMap' => [
            'user_name' => 'user_name',
            'date' => 'date',
            'start' => 'start',
            'end' => 'end',
            'type' => 'type',
        ],
        'defaultFields' => ['user_name', 'date', 'start', 'end'],
        'relationships' => ['user', 'place'],
        'filename' => 'reservations_export_' . now()->format('Y_m_d_H_i_s'),
        'transformers' => [
            'user_name' => function($reservation) {
                return $reservation->user->name ?? 'N/A';
            },
            'date' => function($reservation) {
                return $reservation->date ? date('Y-m-d', strtotime($reservation->date)) : '';
            },
            'type' => function($reservation) {
                return ucfirst(str_replace('_', ' ', $reservation->type));
            },
        ],
        'headings' => [
            'user_name' => 'User Name',
            'date' => 'Reservation Date',
            'start' => 'Start Time',
            'end' => 'End Time',
        ],
    ]);
}
```

## Example: Reservations Export

```php
// In ReservationsController.php
use App\Services\ExportService;

public function export(Request $request)
{
    $query = Reservation::query();
    
    // Apply filters
    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }
    if ($request->filled('type')) {
        $query->where('type', $request->query('type'));
    }
    
    $fields = explode(',', $request->query('fields', 'user_name,date,type'));
    
    return ExportService::export($query, $fields, [
        'fieldMap' => [
            'user_name' => 'user_name',
            'date' => 'date',
            'start' => 'start',
            'end' => 'end',
            'type' => 'type',
            'status' => 'status',
        ],
        'defaultFields' => ['user_name', 'date', 'type'],
        'relationships' => ['user'],
        'filename' => 'reservations_export_' . now()->format('Y_m_d_H_i_s'),
        'transformers' => [
            'status' => function($reservation) {
                return $reservation->approved ? 'Approved' : ($reservation->canceled ? 'Canceled' : 'Pending');
            },
        ],
    ]);
}
```

## Options Available

- `fieldMap`: Array of allowed fields (for validation)
- `transformers`: Array of callable functions to transform field values
- `headings`: Custom column headings
- `relationships`: Array of relationships to eager load
- `filename`: Custom filename (without .xlsx extension)
- `defaultFields`: Default fields if none are selected

