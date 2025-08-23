# Bookly Availability Service - Integration Testing Guide

This directory contains comprehensive Postman collections for testing all availability service endpoints, including the newly documented waiting list and reassignment functionality.

## 📋 Collections Overview

### Core Collections
- **01-availability-management-rf07.postman_collection.json** - Basic availability management
- **02-calendar-integration-rf08.postman_collection.json** - Calendar integration features
- **03-calendar-views-rf10.postman_collection.json** - Calendar view endpoints
- **04-reservation-history-rf11.postman_collection.json** - Reservation history tracking
- **05-reservations-waitlist.postman_collection.json** - Basic reservation and waitlist operations

### Comprehensive New Collections
- **06-waiting-list-comprehensive.postman_collection.json** - Complete waiting list functionality
- **07-reassignment-comprehensive.postman_collection.json** - Complete reassignment functionality

## 🚀 Quick Start

### 1. Environment Setup
Import the testing environment:
```
bookly-availability-testing.postman_environment.json
```

### 2. Required Environment Variables
Before running tests, set these variables in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | Availability service base URL | `http://localhost:3000/availability` |
| `authToken` | JWT token for regular user | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `adminToken` | JWT token for admin user | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `testResourceId` | Resource ID for testing | `resource-test-classroom-001` |
| `testUserId` | User ID for testing | `user-test-professor-001` |

### 3. Authentication Setup
1. Run auth service login endpoint to get tokens
2. Set `authToken` for regular user operations
3. Set `adminToken` for administrative operations

## 🧪 Testing Scenarios

### Waiting List Testing Flow
1. **Join Waiting List** - Create waiting list entries
2. **Get My Entries** - Verify user can see their entries
3. **Get Entry by ID** - Test individual entry retrieval
4. **Escalate Priority** - Test admin priority escalation
5. **Process Available Slots** - Test slot notification system
6. **Confirm Notification** - Test user response to notifications
7. **Leave Waiting List** - Test removal from queue
8. **Statistics & Analytics** - Test reporting endpoints

### Reassignment Testing Flow
1. **Create Request** - Submit reassignment requests
2. **Find Equivalent Resources** - Test resource discovery
3. **Validate Request** - Test feasibility validation
4. **Admin Response** - Test admin approval/rejection
5. **Auto-Processing** - Test AI-powered processing
6. **Bulk Operations** - Test batch processing
7. **Analytics** - Test success prediction and reporting
8. **User History** - Test historical data retrieval

## 📊 Test Coverage

### Waiting List Endpoints (14 endpoints)
- ✅ POST `/waiting-list` - Join waiting list
- ✅ GET `/waiting-list/my-entries` - Get user entries
- ✅ GET `/waiting-list/{id}` - Get entry by ID
- ✅ POST `/waiting-list/{id}/confirm` - Confirm notification
- ✅ DELETE `/waiting-list/{id}` - Leave waiting list
- ✅ GET `/waiting-list/resource/{resourceId}` - Get resource queue
- ✅ POST `/waiting-list/escalate-priority` - Escalate priority
- ✅ POST `/waiting-list/process-slots` - Process available slots
- ✅ GET `/waiting-list/statistics` - Get statistics
- ✅ POST `/waiting-list/validate-join` - Validate join request
- ✅ GET `/waiting-list/{id}/position` - Get position info
- ✅ POST `/waiting-list/bulk-notify` - Bulk notifications
- ✅ POST `/waiting-list/process-expired` - Process expired entries
- ✅ GET `/waiting-list/analytics` - Performance analytics

### Reassignment Endpoints (13 endpoints)
- ✅ POST `/reassignment` - Create request
- ✅ GET `/reassignment` - Get requests with filters
- ✅ GET `/reassignment/{id}` - Get request by ID
- ✅ DELETE `/reassignment/{id}` - Cancel request
- ✅ POST `/reassignment/{id}/respond` - Admin response
- ✅ POST `/reassignment/{id}/auto-process` - Auto-process
- ✅ POST `/reassignment/find-equivalent` - Find alternatives
- ✅ POST `/reassignment/validate` - Validate request
- ✅ GET `/reassignment/analytics` - Get analytics
- ✅ POST `/reassignment/bulk-process` - Bulk processing
- ✅ POST `/reassignment/predict-success` - Success prediction
- ✅ GET `/reassignment/user/{userId}/history` - User history
- ✅ POST `/reassignment/optimize-config` - Optimize configuration

## 🔧 Advanced Testing

### Automated Test Scripts
Each request includes comprehensive test scripts that validate:
- HTTP status codes
- Response structure and required fields
- Business logic validation
- Error handling scenarios
- Data persistence across requests

### Test Data Management
- Dynamic test data generation using pre-request scripts
- Environment variable chaining for dependent requests
- Cleanup procedures for test isolation

### Performance Testing
- Response time validation
- Concurrent request handling
- Load testing scenarios for bulk operations

## 🚨 Error Scenarios

### Common Test Cases
1. **Authentication Errors** - Invalid/expired tokens
2. **Validation Errors** - Invalid request payloads
3. **Business Logic Errors** - Conflicting reservations, invalid time slots
4. **Resource Not Found** - Non-existent resources/entries
5. **Permission Errors** - Unauthorized access attempts

### Expected Error Responses
All error responses follow the standard format:
```json
{
  "code": "AVAIL-0301",
  "message": "Waiting list entry not found",
  "type": "error",
  "exception_code": "WL-404",
  "http_code": 404,
  "http_exception": "NotFoundException"
}
```

## 📈 Monitoring and Reporting

### Test Execution Reports
- Use Postman's built-in reporting for test results
- Newman CLI for automated test execution
- Integration with CI/CD pipelines

### Performance Metrics
- Average response times per endpoint
- Success/failure rates
- Resource utilization during testing

## 🔄 Continuous Integration

### Newman CLI Usage
```bash
# Install Newman
npm install -g newman

# Run waiting list tests
newman run 06-waiting-list-comprehensive.postman_collection.json \
  -e bookly-availability-testing.postman_environment.json \
  --reporters cli,json

# Run reassignment tests
newman run 07-reassignment-comprehensive.postman_collection.json \
  -e bookly-availability-testing.postman_environment.json \
  --reporters cli,json
```

### GitHub Actions Integration
```yaml
- name: Run API Tests
  run: |
    newman run postman/06-waiting-list-comprehensive.postman_collection.json \
      -e postman/bookly-availability-testing.postman_environment.json \
      --reporters cli,junit --reporter-junit-export results.xml
```

## 📝 Best Practices

1. **Test Isolation** - Each test should be independent
2. **Data Cleanup** - Clean up test data after execution
3. **Environment Management** - Use separate environments for different test stages
4. **Documentation** - Keep test descriptions up to date
5. **Version Control** - Track collection changes with meaningful commits

## 🐛 Troubleshooting

### Common Issues
1. **Token Expiration** - Refresh authentication tokens regularly
2. **Service Unavailable** - Ensure availability service is running
3. **Database State** - Reset test database between test runs
4. **Network Issues** - Check service connectivity and ports

### Debug Mode
Enable Postman console logging to debug request/response details and script execution.
