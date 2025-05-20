Inventory Management Framework
Overview
The Inventory Management Framework is designed to streamline inventory tracking, product management, and stock control. This framework provides essential functionalities for managing inventory efficiently.
Features
•	🔐 Authentication & Authorization – Secure access control for different user roles.
•	📦 Product Management – Add, update, and delete, list products & show product info for an individual product
•	📊 Stock Tracking – Manage and Monitor stock levels in real-time.
•	📜 Transaction History – Keep track of inventory changes.
•	🔍 Search – Easily find products using search by id.
Refer https://apiforshopsinventorymanagementsystem-qnkc.onrender.com/api-docs/#/ for documentation.
Installation
Prerequisites
•	Node.js  v22.15.1  - (v22+ recommended)
•	Cypress - v14.3.3 - (v14+ recommended)
•	IDE(ex:VSC)
•	Git Bash
•	Refer package.json
Setup
1.	Clone the repository: git clone https://github.com/lakshmannnn/Inventory-Management-framework.git Install
2.	Navigate to using: cd Inventory-Management-framework 
3.	Install dependencies: npm install 
4.	Install npx : npm i npx
Usage
•	Run Tests:
npx cypress run  (to open the tests in headless mode/termina execuation)
npx cypress run  --headed (to open the tests in headed mode/cypress app)
 
 



API Endpoints:
User Management :Endpoints for user registration and login
1.	POST /auth/login – to login to app and secure bearer token
Product Management - Endpoints for managing inventory products
2.	GET /products – Fetch all products
3.	GET /products/{productId} – to fetch individual product details
4.	POST /products – Add a new product
5.	PUT /products/{productId}– Update product details
6.	DELETE /products/{productId}– Remove a product
Stock Management - Endpoints for handling product orders
7.	POST /orders – Creates new Buy or Sell orders
8.	GET /orders/products/{productId} – to know the current state of stocks
Status
9.	GET /status - check API and DB status
