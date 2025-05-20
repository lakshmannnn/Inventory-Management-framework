Inventory Management Framework Overview\n
The Inventory Management Framework is designed to streamline inventory tracking, product management, and stock control. This framework provides essential functionalities for managing inventory efficiently.
Features
•	🔐 Authentication & Authorization – Secure access control for different user roles.
•	📦 Product Management – Add, update, and delete, list products & show product info for an individual product
•	📊 Stock Tracking – Manage and Monitor stock levels in real-time.
•	📜 Transaction History – Keep track of inventory changes.
•	🔍 Search – Easily find products using search by id.
Installation
Prerequisites
•	Node.js  v22.15.1  - (v22+ recommended)
•	Cypress - v14.3.3 - (v14+ recommended)
•	Refer package.json
Setup
1.	Clone the repository:
git clone https://github.com/lakshmannnn/Inventory-Management-framework.git cd Inventory-Management-framework 
2.	Install dependencies:
npm install 
Usage
•	Run Tests:
npx cypress run 
•	API Endpoints:
•	GET /products – Fetch all products
•	POST /products – Add a new product
•	PUT /products/:id – Update product details
•	DELETE /products/:id – Remove a product
