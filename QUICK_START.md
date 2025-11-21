# 🚀 Quick Start Guide - Ashly Store API

## ✅ What's Already Done

Your backend is **100% ready**! Here's what we built:

### 📦 Features

- ✅ Product Management (Create, Read, Update, Delete)
- ✅ Multiple Image Upload (up to 10 images per product)
- ✅ Size & Color Management
- ✅ Stock/Quantity tracking per size
- ✅ Search & Filter products
- ✅ Pagination
- ✅ Input Validation
- ✅ Error Handling
- ✅ MongoDB Database Connected

### 🏗️ Architecture (Clean & Best Practices)

```
src/
├── config/          # Database configuration
├── models/          # Data schemas (Product)
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middleware/      # Upload, Validation, Error handling
├── utils/           # Helper functions & constants
└── server.js        # Application entry point
```

---

## 🎯 Server Status

✅ **Server Running:** `http://localhost:5000`  
✅ **Database:** Connected to MongoDB (ashly-store)  
✅ **Products API:** `http://localhost:5000/api/products`

---

## 📡 API Endpoints

### Product Management

| Method   | Endpoint                  | Description                     |
| -------- | ------------------------- | ------------------------------- |
| `GET`    | `/api/products`           | Get all products (with filters) |
| `GET`    | `/api/products/:id`       | Get single product              |
| `POST`   | `/api/products`           | Create new product              |
| `PUT`    | `/api/products/:id`       | Update product                  |
| `DELETE` | `/api/products/:id`       | Delete product                  |
| `PATCH`  | `/api/products/:id/stock` | Update stock only               |

---

## 🧪 How to Test

### Option 1: Using Postman (Recommended)

1. Import the file: `Ashly-Store-API.postman_collection.json`
2. The collection includes all endpoints ready to use
3. For creating products, upload images in the `images` field

### Option 2: Using REST Client (VS Code)

1. Open `api-tests.http`
2. Click "Send Request" above each endpoint
3. (Note: File upload requires Postman)

---

## 📝 Example: Create Product

### Using Postman

**POST** `http://localhost:5000/api/products`

**Body (form-data):**

| Key         | Type | Value                                                            |
| ----------- | ---- | ---------------------------------------------------------------- |
| name        | Text | `Classic T-Shirt`                                                |
| description | Text | `Comfortable cotton t-shirt`                                     |
| category    | Text | `T-Shirt`                                                        |
| price       | Text | `299`                                                            |
| colors      | Text | `["White", "Black", "Navy"]`                                     |
| sizes       | Text | `[{"name": "S", "quantity": 10}, {"name": "M", "quantity": 15}]` |
| images      | File | Upload 1-10 image files                                          |

**Response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Classic T-Shirt",
    "price": 299,
    "totalQuantity": 25,
    ...
  }
}
```

---

## 📊 Product Categories

- T-Shirt
- Sweatshirt
- Hoodie
- Pants
- Jeans
- Shorts
- Jacket
- Other

## 📏 Available Sizes

- XS, S, M, L, XL, XXL, 2XL, 3XL

---

## 🔍 Search & Filter

### Get all products

```
GET /api/products
```

### Filter by category

```
GET /api/products?category=T-Shirt
```

### Search products

```
GET /api/products?search=cotton
```

### Pagination

```
GET /api/products?page=1&limit=10
```

### Combine filters

```
GET /api/products?category=T-Shirt&page=1&limit=5&search=classic
```

---

## 🖼️ Image Upload

- **Max files:** 10 per product
- **Max size:** 5MB per image
- **Formats:** JPEG, JPG, PNG, GIF, WEBP
- **Stored in:** `/uploads` folder
- **Access via:** `http://localhost:5000/uploads/filename.jpg`

---

## 🗄️ MongoDB Compass

**Connection String:**

```
mongodb+srv://amrosama376_db_user:UyzNhy5kqbmqGnIK@cluster0.l6vluv6.mongodb.net/ashly-store?retryWrites=true&w=majority&appName=Cluster0
```

**Database Name:** `ashly-store`  
**Collection:** `products`

---

## 🛠️ Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Stop server
Ctrl + C
```

---

## 🔮 Next Steps (Future - User Module)

The architecture is ready for:

- ✨ User Authentication (Register/Login)
- 🔐 JWT Tokens
- 👤 User Roles (Admin/Customer)
- 🛒 Shopping Cart
- 📦 Orders System
- 💳 Payment Integration
- ⭐ Product Reviews
- ❤️ Wishlist

---

## 📞 Need Help?

1. **Check README.md** - Full documentation
2. **Check api-tests.http** - Example requests
3. **Import Postman Collection** - Ready-to-use endpoints

---

## ✅ You're Ready!

Your backend is **production-ready** with:

- Clean architecture
- Best practices
- Error handling
- Input validation
- Database connected
- File upload ready

**Just test the APIs and start building your frontend!** 🚀
