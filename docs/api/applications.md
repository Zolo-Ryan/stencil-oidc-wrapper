# Application 

## Overview
The ApplicationService is a crucial component of our NestJS application, responsible for managing application-related operations. It provides functionality for creating, updating, retrieving, and deleting applications, as well as managing their OAuth configurations and associated roles and scopes.


## Sequence Diagram

![Applications Sequence Diagram](../assets/sequence-diagrams/application.png)

## Endpoints

### 1. Create Application with random id 
- **Endpoint** : Post `/application`
- **Description** : Creates a new application with the provided details.
- **Authorization-Header** : Required
- **Parameters:**
    - `uuid: string` - Unique identifier for the application
    - `data: CreateApplicationDto` - Application data

### 1. Create Application with given id 
- **Endpoint** : Post `/application/:applicationId`
- **Description** : Creates a new application with the provided details.
- **Authorization-Header** : Required
- **Parameters:**
    - `uuid: string` - Unique identifier for the application
    - `data: CreateApplicationDto` - Application data
- **Sample cURL**:
  ```sh
  curl -X POST http://localhost:3000/application/<applicationId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<application_name>",
    "description": "<application_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http POST http://localhost:3000/application/<applicationId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<application_name>",
    "description": "<application_description>"
  }'



### 2. Patch Application
- **Endpoint** : Patch `/application/:applicationId`
- **Description** : Updates an existing application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `newData: UpdateApplicationDto` - Updated application data
- **Sample cURL**:
  ```sh
  curl -X PATCH http://localhost:3000/application/<applicationId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<updated_application_name>",
    "description": "<updated_application_description>"
  }'


- **Sample HTTPie**:
  ```sh
  http PATCH http://localhost:3000/application/<applicationId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<updated_application_name>",
    "description": "<updated_application_description>"
  }'


### 3. Return All Applications
- **Endpoint** : Get `/application`
- **Description** : Retrieves all applications with their associated roles and scopes.
- **Authorization-Header** : Required
- **Parameters:**
    - `headers: object` - Request headers
- **Sample cURL**:
  ```sh
  curl -X GET http://localhost:3000/application \
  -H "Authorization: Bearer <your_access_token>"

- **Sample HTTPie**:
  ```sh
  http GET http://localhost:3000/application \
  Authorization:"Bearer <your_access_token>"

### 4. Return An Application
- **Endpoint** : Get `/application/:applicationId`
- **Description** : Retrieves a specific application by ID, including its roles and scopes.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
- **Sample cURL**:
  ```sh
  curl -X GET http://localhost:3000/application/<applicationId> \
  -H "Authorization: Bearer <your_access_token>"

- **Sample HTTPie**:
  ```sh
  http GET http://localhost:3000/application/<applicationId> \
  Authorization:"Bearer <your_access_token>"

### 5. Delete Application
- **Endpoint** : Get `/application/:applicationId`
- **Description** : Deletes an application (soft or hard delete).
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `hardDelete: boolean` - Whether to perform a hard delete
- **Sample cURL**:
  ```sh
  curl -X DELETE http://localhost:3000/application/<applicationId> \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "hardDelete": <true_or_false>
  }'

- **Sample HTTPie**:
  ```sh
  http DELETE http://localhost:3000/application/<applicationId> \
  Authorization:"Bearer <your_access_token>" \
  hardDelete=<true_or_false>

### 6. Return Oauth Configuration
- **Endpoint** : Get `/application/:applicationId/oauth-configuration`
- **Description** : Retrieves the OAuth configuration for a specific application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
- **Sample cURL**:
  ```sh
  curl -X GET http://localhost:3000/application/<applicationId>/oauth-configuration \
  -H "Authorization: Bearer <your_access_token>"

- **Sample HTTPie**:
  ```sh
  http GET http://localhost:3000/application/<applicationId>/oauth-configuration \
  Authorization:"Bearer <your_access_token>"

<br>

# Application Scopes

## Overview
The ApplicationScopesService is a crucial component of our NestJS application, responsible for managing OAuth scopes for applications. It provides functionality for creating, retrieving, updating, and deleting scopes associated with specific applications.

## Key Features
1. Scope CRUD operations
2. Tenant-based authorization
3. Application-specific scope management
4. Detailed error handling and logging

## Endpoints

### 1. Create Scope with random id
- **Endpoint** : Post `/application/:applicationId/scope`
- **Description** : Creates a new scope for a specific application.
- **Authorization-Header** : Required
- **Parameters:**
    - `data: ScopeDto` - Scope data
    - `applicationsId: string` - Application ID
    - `scopeId: string` - Optional scope ID
- **Sample cURL**:
  ```sh
  curl -X POST http://localhost:3000/application/<applicationId>/scope \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<scope_name>",
    "description": "<scope_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http POST http://localhost:3000/application/<applicationId>/scope \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<scope_name>",
    "description": "<scope_description>"
  }'

### 2. Create Scope with given id
- **Endpoint** : Post `/application/:applicationId/scope/:scopeId`
- **Description** : Creates a new scope for a specific application.
- **Authorization-Header** : Required
- **Parameters:**
    - `data: ScopeDto` - Scope data
    - `applicationsId: string` - Application ID
    - `scopeId: string` - Optional scope ID
- **Sample cURL**:
  ```sh
  curl -X POST http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<scope_name>",
    "description": "<scope_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http POST http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<scope_name>",
    "description": "<scope_description>"
  }'

### 3. Update Scope
- **Endpoint** : Patch `/application/:applicationId/scope/:scopeId`
- **Description** : Updates an existing scope for an application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `scopeId: string` - Scope ID
    - `data: UpdateScopeDto` - Updated scope data
- **Sample cURL**:
  ```sh
  curl -X PATCH http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<updated_scope_name>",
    "description": "<updated_scope_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http PATCH http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<updated_scope_name>",
    "description": "<updated_scope_description>"
  }'

### 4. Delete Scope
- **Endpoint** : Delete `/application/:applicationId/scope/:scopeId`
- **Description** : Deletes a scope from an application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `scopeId: string` - Scope ID
- **Sample cURL**:
  ```sh
  curl -X DELETE http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  -H "Authorization: Bearer <your_access_token>"

- **Sample HTTPie**:
  ```sh
  http DELETE http://localhost:3000/application/<applicationId>/scope/<scopeId> \
  Authorization:"Bearer <your_access_token>"

<br>

# Application Roles 

## Overview
The ApplicationRolesService is a crucial component of our NestJS application, responsible for managing roles for applications. It provides functionality for creating, retrieving, updating, and deleting roles associated with specific applications.

## Key Features
1. Role CRUD operations
2. Tenant-based authorization
3. Application-specific role management
4. Detailed error handling and logging

## Endpoints

### 1. Create Role with random id
- **Endpoint** : Post `/application/:applicationId/role`
- **Descripiton** : Creates a new role for a specific application.
- **Authorization-Header** : Required
- **Parameters:**
    - `data: RoleDto` - Role data
    - `applicationsId: string` - Application ID
    - `roleId: string` - Optional role ID
- **Sample cURL**:
  ```sh
  curl -X POST http://localhost:3000/application/<applicationId>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<role_name>",
    "description": "<role_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http POST http://localhost:3000/application/<applicationId>/role \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<role_name>",
    "description": "<role_description>"
  }'

### 2. Create Role with given id
- **Endpoint** : Post `/application/:applicationId/role/:roleId`
- **Descripiton** : Creates a new role for a specific application.
- **Authorization-Header** : Required
- **Parameters:**
    - `data: RoleDto` - Role data
    - `applicationsId: string` - Application ID
    - `roleId: string` - Optional role ID
- **Sample cURL**:
  ```sh
  curl -X POST http://localhost:3000/application/<applicationId>/role/<roleId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<role_name>",
    "description": "<role_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http POST http://localhost:3000/application/<applicationId>/role/<roleId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<role_name>",
    "description": "<role_description>"
  }'


### 3. Update Role
- **Endpoint** : Patch `/application/:applicationId/role/:roleId`
- **Descripiton** : Updates an existing role for an application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `roleId: string` - Role ID
    - `data: UpdateRoleDto` - Updated role data
- **Sample cURL**:
  ```sh
  curl -X PATCH http://localhost:3000/application/<applicationId>/role/<roleId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "name": "<updated_role_name>",
    "description": "<updated_role_description>"
  }'

- **Sample HTTPie**:
  ```sh
  http PATCH http://localhost:3000/application/<applicationId>/role/<roleId> \
  Authorization:"Bearer <your_access_token>" \
  data:='{
    "name": "<updated_role_name>",
    "description": "<updated_role_description>"
  }'


### 4. Delete Role
- **Endpoint** : Delete `/application/:applicationId/role/:roleId`
- **Descripiton** : Deletes a role from an application.
- **Authorization-Header** : Required
- **Parameters:**
    - `id: string` - Application ID
    - `roleId: string` - Role ID
- **cURL**:
  ```sh
  curl -X DELETE http://localhost:3000/application/<applicationId>/role/<roleId> \
  -H "Authorization: Bearer <your_access_token>"

- **HTTPie**:
  ```sh
  http DELETE http://localhost:3000/application/<applicationId>/role/<roleId> \
  Authorization:"Bearer <your_access_token>"

## Error Handling
The service implements comprehensive error handling, throwing appropriate exceptions:
- BadRequestException
- UnauthorizedException
- InternalServerErrorException

## Authorization
All endpoints are protected by authorization headers which requires authorization and x-stencil-tenanid values to be passed in headers, which are verified using the `HeaderAuthService`.

## Usage Notes
1. Ensure that the necessary environment variables and configurations are set up for Prisma and other dependent services.
2. The service expects certain headers for authorization, including `x-stencil-tenantid` for tenant-scoped operations.
3. When creating or updating roles, make sure to provide all required fields in the DTO objects.
4. The service interacts closely with the database using Prisma ORM. Ensure your database schema matches the expected structure for applications and roles.
5. The `isDefault` and `isSuperRole` flags in the role data can be used to designate special roles within an application.

