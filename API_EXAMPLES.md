# 🛍️ Ashly Store - Complete API Examples

## Base URL

```
http://localhost:5000
```

---

## 📦 Products API

### 1. Get All Products

```http
GET /api/products
```

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

**Query Parameters:**

- `?page=1` - صفحة رقم
- `?limit=20` - عدد المنتجات في الصفحة
- `?category=sweatshirt` - فلترة حسب النوع

---

### 2. Get Single Product

```http
GET /api/products/65a7b8c9d0e1f2a3b4c5d6e7
```

---

### 3. Create New Product (Admin)

```http
POST /api/products
Content-Type: multipart/form-data

{
  "name": "Sweatshirt أسود",
  "description": "سويت شيرت قطن 100%",
  "price": 500,
  "category": "sweatshirt",
  "colors": ["أسود", "أبيض", "رمادي"],
  "sizes[M]": 10,
  "sizes[L]": 15,
  "sizes[XL]": 8,
  "sizes[XXL]": 5,
  "images": [file1, file2, file3]
}
```

**📝 Note:**

- الـ sizes إجباري تحتوي على: M, L, XL, XXL
- Colors: array من الألوان المتاحة
- Images: من 1 لـ 10 صور (max 5MB لكل صورة)

---

### 4. Update Product

```http
PUT /api/products/65a7b8c9d0e1f2a3b4c5d6e7
Content-Type: application/json

{
  "name": "Sweatshirt أسود - Updated",
  "price": 550,
  "sizes": {
    "L": 20,
    "XL": 12
  }
}
```

**⚠️ مهم:**

- بيحدث فقط الـ sizes اللي انت باعتها
- باقي الـ sizes بتفضل زي ما هي

---

### 5. Update Single Size Stock

```http
PATCH /api/products/65a7b8c9d0e1f2a3b4c5d6e7/stock
Content-Type: application/json

{
  "sizeName": "L",
  "quantity": 25
}
```

---

### 6. Delete Product (Admin)

```http
DELETE /api/products/65a7b8c9d0e1f2a3b4c5d6e7
```

---

## 🛒 Cart API (Anonymous)

### 1. Create New Cart

```http
POST /api/cart
```

**Response:**

```json
{
  "success": true,
  "message": "Cart created successfully",
  "data": {
    "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "cart": {
      "_id": "65a7b8c9d0e1f2a3b4c5d6e7",
      "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
      "items": [],
      "totalItems": 0,
      "totalPrice": 0,
      "isActive": true
    }
  }
}
```

**💾 احفظ الـ sessionId:**

```javascript
localStorage.setItem("cart_session_id", data.data.sessionId);
```

---

### 2. Get Cart

```http
GET /api/cart/a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "items": [
      {
        "_id": "65a7b8c9d0e1f2a3b4c5d6e8",
        "product": {
          "_id": "65a7b8c9d0e1f2a3b4c5d6e7",
          "name": "Sweatshirt أسود",
          "price": 500,
          "images": ["http://localhost:5000/uploads/..."]
        },
        "size": "L",
        "color": "أسود",
        "quantity": 2,
        "price": 500
      }
    ],
    "totalItems": 2,
    "totalPrice": 1000
  }
}
```

---

### 3. Add Item to Cart

```http
POST /api/cart/a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6/items
Content-Type: application/json

{
  "productId": "65a7b8c9d0e1f2a3b4c5d6e7",
  "size": "L",
  "color": "أسود",
  "quantity": 2
}
```

**Validations:**

- Size يجب أن يكون: M, L, XL, أو XXL
- Color يجب أن يكون موجود في المنتج
- Quantity لا يجب أن تتجاوز الـ stock المتاح

**If item already exists:**

- الكمية بتزيد تلقائياً (quantity += new quantity)

---

### 4. Update Item Quantity

```http
PUT /api/cart/a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6/items/65a7b8c9d0e1f2a3b4c5d6e8
Content-Type: application/json

{
  "quantity": 3
}
```

---

### 5. Remove Item from Cart

```http
DELETE /api/cart/a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6/items/65a7b8c9d0e1f2a3b4c5d6e8
```

---

### 6. Clear Cart

```http
DELETE /api/cart/a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6
```

---

## 📋 Orders API

### 1. Create Order (Checkout)

```http
POST /api/orders
Content-Type: application/json

{
  "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "phone": "01234567890",
  "streetAddress": "15 شارع الجامعة، الدقي",
  "city": "الجيزة",
  "state": "الجيزة",
  "notes": "من فضلك اتصل قبل التوصيل",
  "shippingFee": 50
}
```

**Required Fields:**

- sessionId ✅
- firstName ✅
- lastName ✅
- email ✅
- phone ✅
- streetAddress ✅
- city ✅
- state ✅

**Optional Fields:**

- notes
- shippingFee (default: 0)

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "65a7b8c9d0e1f2a3b4c5d6e9",
    "orderNumber": "ORD-241119-0001",
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "phone": "01234567890",
    "streetAddress": "15 شارع الجامعة، الدقي",
    "city": "الجيزة",
    "state": "الجيزة",
    "items": [
      {
        "product": "65a7b8c9d0e1f2a3b4c5d6e7",
        "productName": "Sweatshirt أسود",
        "productImage": "http://localhost:5000/uploads/...",
        "size": "L",
        "color": "أسود",
        "quantity": 2,
        "price": 500,
        "subtotal": 1000
      }
    ],
    "totalItems": 2,
    "totalPrice": 1000,
    "shippingFee": 50,
    "finalPrice": 1050,
    "status": "pending",
    "notes": "من فضلك اتصل قبل التوصيل",
    "createdAt": "2024-11-19T20:15:00.000Z"
  }
}
```

**✅ What happens after order creation:**

1. Cart تتمسح تلقائياً وتتعمل inactive
2. الكمية بتنقص من الـ stock لكل منتج
3. Order بيتحفظ في الداتابيز
4. Order number بيتولد تلقائياً: `ORD-YYMMDD-XXXX`

---

### 2. Get All Orders (Admin)

```http
GET /api/orders
```

**Query Parameters:**

- `?status=pending` - فلترة حسب الحالة
- `?page=1` - رقم الصفحة
- `?limit=20` - عدد الطلبات في الصفحة

**Response:**

```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [...]
}
```

---

### 3. Search Orders by Email or Phone

```http
GET /api/orders/search?email=ahmed@example.com

# أو

GET /api/orders/search?phone=01234567890
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65a7b8c9d0e1f2a3b4c5d6e9",
      "orderNumber": "ORD-241119-0001",
      "firstName": "أحمد",
      "lastName": "محمد",
      "status": "delivered",
      "finalPrice": 1050,
      "createdAt": "2024-11-19T20:15:00.000Z"
    },
    ...
  ]
}
```

---

### 4. Get Order by ID

```http
GET /api/orders/65a7b8c9d0e1f2a3b4c5d6e9
```

---

### 5. Update Order Status (Admin)

```http
PATCH /api/orders/65a7b8c9d0e1f2a3b4c5d6e9/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Valid Statuses:**

- `pending` - في الانتظار
- `confirmed` - تم التأكيد ✅
- `processing` - جاري التجهيز ⏳
- `shipped` - تم الشحن 📦
- `delivered` - تم التوصيل 🎉
- `cancelled` - ملغي ❌

**Response:**

```json
{
  "success": true,
  "message": "Order status updated to confirmed",
  "data": {
    ...order details,
    "status": "confirmed",
    "confirmedAt": "2024-11-19T20:30:00.000Z"
  }
}
```

---

### 6. Cancel Order

```http
PATCH /api/orders/65a7b8c9d0e1f2a3b4c5d6e9/cancel
```

**⚠️ Rules:**

- مينفعش إلغاء طلب لو `status = shipped` أو `delivered`
- لو الطلب اتلغى، الكمية بترجع للـ stock تاني

**Response:**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    ...order details,
    "status": "cancelled",
    "cancelledAt": "2024-11-19T20:45:00.000Z"
  }
}
```

---

## 🔥 Complete Purchase Flow Example

### Step 1: Create Cart

```javascript
const createCart = await fetch("http://localhost:5000/api/cart", {
  method: "POST",
});
const { data } = await createCart.json();
const sessionId = data.sessionId;

// Save sessionId
localStorage.setItem("cart_session_id", sessionId);
```

### Step 2: Add Items

```javascript
const addItem = await fetch(
  `http://localhost:5000/api/cart/${sessionId}/items`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: "65a7b8c9d0e1f2a3b4c5d6e7",
      size: "L",
      color: "أسود",
      quantity: 2,
    }),
  }
);
```

### Step 3: View Cart

```javascript
const getCart = await fetch(`http://localhost:5000/api/cart/${sessionId}`);
const cart = await getCart.json();
console.log("Total:", cart.data.totalPrice);
```

### Step 4: Checkout

```javascript
const checkout = await fetch("http://localhost:5000/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: sessionId,
    firstName: "أحمد",
    lastName: "محمد",
    email: "ahmed@example.com",
    phone: "01234567890",
    streetAddress: "15 شارع الجامعة",
    city: "الجيزة",
    state: "الجيزة",
    shippingFee: 50,
  }),
});

const order = await checkout.json();
console.log("Order Number:", order.data.orderNumber);

// Clear sessionId after successful checkout
localStorage.removeItem("cart_session_id");
```

### Step 5: Track Order

```javascript
const trackOrder = await fetch(
  `http://localhost:5000/api/orders/search?email=ahmed@example.com`
);
const orders = await trackOrder.json();
console.log("My Orders:", orders.data);
```

---

## 🎨 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Only 5 items available in stock for size L"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## 📝 Notes

1. **No Authentication Required** - كل الـ endpoints public
2. **SessionId Management** - احفظه في localStorage
3. **Stock Management** - automatic بعد كل order
4. **Order Tracking** - باستخدام email أو phone
5. **Image Upload** - max 10 images, 5MB each
6. **Fixed Sizes** - M, L, XL, XXL only

---

**🚀 Server:** http://localhost:5000
**📊 Health Check:** http://localhost:5000/api/health
