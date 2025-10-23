# Package Management API Integration

## API Endpoints

### 1. PUT /api/admin/memberships/{packageId}
**Cập nhật package**

#### Request
- **Method**: `PUT`
- **URL**: `/api/admin/memberships/{packageId}`
- **Path Parameter**: `packageId` (integer) - ID của package cần cập nhật
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "name": "string",
  "packageType": "string",
  "listingLimit": 0,
  "listingFee": 0,
  "highlight": true,
  "durationDays": 0,
  "commissionDiscount": 0,
  "status": "string"
}
```

#### Response (200 OK)
```json
{
  "message": "string",
  "success": true,
  "data": "string"
}
```

### 2. DELETE /api/admin/memberships/{packageId}
**Xóa package**

#### Request
- **Method**: `DELETE`
- **URL**: `/api/admin/memberships/{packageId}`
- **Path Parameter**: `packageId` (integer) - ID của package cần xóa

#### Response (200 OK)
```json
{
  "message": "string",
  "success": true,
  "data": "string"
}
```

## Frontend Implementation

### PackageService Methods

```typescript
// Cập nhật package
updatePackage: async (packageId: number, packageData: Partial<CreatePackageRequest>): Promise<UpdatePackageResponse>

// Xóa package
deletePackage: async (packageId: number): Promise<DeletePackageResponse>
```

### Usage Examples

#### 1. Update Package
```typescript
const handleUpdatePackage = async () => {
  try {
    const response = await PackageService.updatePackage(packageId, {
      name: "Premium Package",
      packageType: "LISTING_PREMIUM",
      listingLimit: 10,
      listingFee: 50000,
      highlight: true,
      durationDays: 30,
      commissionDiscount: 15,
      status: "ACTIVE"
    });
    
    showToast(response.message || 'Cập nhật package thành công!', 'success');
  } catch (error) {
    showToast(`Lỗi cập nhật package: ${error.message}`, 'error');
  }
};
```

#### 2. Delete Package
```typescript
const handleDeletePackage = async (packageId: number) => {
  if (!window.confirm('Bạn có chắc chắn muốn xóa package này?')) return;
  
  try {
    const response = await PackageService.deletePackage(packageId);
    showToast(response.message || 'Xóa package thành công!', 'success');
    fetchPackages(); // Refresh danh sách
  } catch (error) {
    showToast(`Lỗi xóa package: ${error.message}`, 'error');
  }
};
```

## UI Components

### Edit Package Form
- Form validation cho tất cả fields
- Pre-populate data từ package hiện tại
- Submit → PUT API call
- Success → Toast notification + refresh list

### Delete Package
- Confirmation dialog trước khi xóa
- DELETE API call
- Success → Toast notification + refresh list

## Error Handling

### Common Error Scenarios
1. **Package not found** (404)
2. **Validation errors** (400)
3. **Unauthorized access** (401)
4. **Server errors** (500)

### Error Response Format
```json
{
  "message": "Error description",
  "success": false,
  "data": null
}
```

## Testing

### Manual Testing Steps

1. **Update Package Test:**
   - Navigate to `/admin/packages`
   - Click Edit button on any package
   - Modify package data
   - Click "Cập nhật Package"
   - Verify success message
   - Verify data updated in list

2. **Delete Package Test:**
   - Navigate to `/admin/packages`
   - Click Delete button on any package
   - Confirm deletion in dialog
   - Verify success message
   - Verify package removed from list

### API Testing with Swagger
- Use Swagger UI at backend endpoint
- Test PUT and DELETE operations
- Verify request/response formats
- Check error scenarios

## Security Considerations

1. **Authentication**: All requests require admin token
2. **Authorization**: Only admin role can access these endpoints
3. **Validation**: Server-side validation for all fields
4. **CSRF Protection**: Implemented via token-based auth

## Performance Notes

1. **Optimistic Updates**: UI updates immediately
2. **Error Rollback**: Revert changes on API failure
3. **Loading States**: Show loading during API calls
4. **Caching**: Refresh data after successful operations
