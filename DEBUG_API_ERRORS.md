# Debug API Errors Guide

## Common API Errors và Solutions

### 1. HTTP 500 Error - Create Package
**Error**: `Failed to load resource: the server responded with a status of 500`

**Possible Causes:**
- Server-side validation errors
- Database connection issues
- Missing required fields
- Invalid data format

**Solutions:**
```typescript
// 1. Validate data before sending
if (!formData.name || !formData.packageType) {
  showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
  return;
}

// 2. Log data being sent
console.log('Creating package with data:', formData);

// 3. Handle server error messages
catch (err: any) {
  console.error('Error creating package:', err);
  showToast(`Lỗi tạo package: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
}
```

### 2. HTTP 400 Error - Delete Package
**Error**: `Failed to load resource: the server responded with a status of 400`
**URL**: `/api/admin/memberships/undefined`

**Cause**: `packageId` is `undefined`

**Solutions:**
```typescript
// 1. Check packageId before calling API
const handleDeletePackage = async (packageId: number) => {
  if (!packageId) {
    showToast('Không thể xóa package: ID không hợp lệ', 'error');
    return;
  }
  // ... rest of function
};

// 2. Safe button click handler
onClick={() => pkg.id ? handleDeletePackage(pkg.id) : showToast('Không thể xóa package: ID không tồn tại', 'error')}
```

### 3. HTTP 401 Error - Unauthorized
**Error**: `Failed to load resource: the server responded with a status of 401`

**Cause**: Invalid or expired token

**Solutions:**
```typescript
// Check token in localStorage
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
  navigate('/login');
}
```

### 4. HTTP 403 Error - Forbidden
**Error**: `Failed to load resource: the server responded with a status of 403`

**Cause**: User doesn't have admin role

**Solutions:**
```typescript
// Check user role before API calls
const { user } = useAuth();
if (user?.role !== 'admin' && user?.roleId !== '2') {
  showToast('Bạn không có quyền thực hiện hành động này', 'error');
  return;
}
```

## Debug Steps

### 1. Check Network Tab
- Open Developer Tools → Network tab
- Perform the action that causes error
- Look for failed requests (red status)
- Check request payload and response

### 2. Check Console Logs
- Look for error messages in console
- Check if data is being sent correctly
- Verify API endpoints are correct

### 3. Validate Data
```typescript
// Before API call, log the data
console.log('Sending data:', {
  name: formData.name,
  packageType: formData.packageType,
  listingLimit: formData.listingLimit,
  listingFee: formData.listingFee,
  highlight: formData.highlight,
  durationDays: formData.durationDays,
  commissionDiscount: formData.commissionDiscount,
  status: formData.status
});
```

### 4. Check API Endpoints
- Verify backend server is running
- Check if endpoints exist
- Verify request/response format matches API spec

## Common Data Issues

### 1. Missing Required Fields
```typescript
// Check required fields
const requiredFields = ['name', 'packageType'];
const missingFields = requiredFields.filter(field => !formData[field]);
if (missingFields.length > 0) {
  showToast(`Vui lòng điền: ${missingFields.join(', ')}`, 'error');
  return;
}
```

### 2. Invalid Data Types
```typescript
// Ensure numbers are numbers
const numericFields = ['listingLimit', 'listingFee', 'durationDays', 'commissionDiscount'];
numericFields.forEach(field => {
  if (typeof formData[field] !== 'number') {
    formData[field] = parseInt(formData[field]) || 0;
  }
});
```

### 3. Boolean Values
```typescript
// Ensure boolean values
if (typeof formData.highlight !== 'boolean') {
  formData.highlight = Boolean(formData.highlight);
}
```

## Error Handling Best Practices

### 1. User-Friendly Messages
```typescript
const getErrorMessage = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Có lỗi xảy ra, vui lòng thử lại';
};
```

### 2. Retry Logic
```typescript
const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 3. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleApiCall = async () => {
  setLoading(true);
  try {
    await apiCall();
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

## Testing Checklist

- [ ] Backend server is running
- [ ] API endpoints are accessible
- [ ] User has correct role/permissions
- [ ] Data validation is working
- [ ] Error messages are user-friendly
- [ ] Loading states are shown
- [ ] Success feedback is displayed
