# 🛒 Ashly Store - User Flow & API Guide

## 📖 سيناريو التسوق الكامل

### المراحل:

1. **User Registration** - تسجيل المستخدم
2. **Browse Products** - تصفح المنتجات
3. **Add to Cart** - إضافة للسلة
4. **Checkout** - إتمام الطلب
5. **Track Order** - متابعة الطلب

---

## 1️⃣ **User Registration (تسجيل المستخدم)**

### **إنشاء أو الحصول على مستخدم**

```
POST http://localhost:5000/api/users
Content-Type: application/json
```

**Body:**

```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01012345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "674c123456789",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "cart": "674c987654321",
    "addresses": [],
    "orders": []
  }
}
```

> **ملحوظة:** لو الإيميل موجود قبل كده، هيرجعلك بيانات المستخدم الموجودة.

---

## 2️⃣ **Browse Products (تصفح المنتجات)**

### **عرض كل المنتجات**

```
GET http://localhost:5000/api/products
```

### **عرض منتج واحد**

```
GET http://localhost:5000/api/products/{product_id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "674a123",
    "name": "Classic T-Shirt",
    "price": 299,
    "colors": ["White", "Black", "Navy"],
    "sizes": [
      { "name": "M", "quantity": 10 },
      { "name": "L", "quantity": 15 },
      { "name": "XL", "quantity": 20 },
      { "name": "XXL", "quantity": 5 }
    ],
    "images": ["/uploads/shirt1.jpg"]
  }
}
```

---

## 3️⃣ **Add to Cart (إضافة للسلة)**

### **إضافة منتج للسلة**

```
POST http://localhost:5000/api/cart/{user_id}/items
Content-Type: application/json
```

**Body:**

```json
{
  "productId": "674a123",
  "size": "L",
  "color": "White",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "674c987",
    "user": "674c123456789",
    "items": [
      {
        "_id": "item123",
        "product": {
          "_id": "674a123",
          "name": "Classic T-Shirt",
          "price": 299,
          "images": ["/uploads/shirt1.jpg"]
        },
        "size": "L",
        "color": "White",
        "quantity": 2,
        "price": 299
      }
    ],
    "totalItems": 2,
    "totalPrice": 598
  }
}
```

### **عرض السلة**

```
GET http://localhost:5000/api/cart/{user_id}
```

### **تعديل كمية منتج في السلة**

```
PUT http://localhost:5000/api/cart/{user_id}/items/{item_id}
Content-Type: application/json
```

**Body:**

```json
{
  "quantity": 3
}
```

### **حذف منتج من السلة**

```
DELETE http://localhost:5000/api/cart/{user_id}/items/{item_id}
```

### **تفريغ السلة**

```
DELETE http://localhost:5000/api/cart/{user_id}
```

---

## 4️⃣ **Add Shipping Address (إضافة عنوان الشحن)**

### **إضافة عنوان جديد**

```
POST http://localhost:5000/api/users/{user_id}/addresses
Content-Type: application/json
```

**Body:**

```json
{
  "street": "123 شارع الجامعة",
  "city": "القاهرة",
  "state": "القاهرة",
  "postalCode": "11511",
  "isDefault": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "674c123456789",
    "name": "أحمد محمد",
    "addresses": [
      {
        "_id": "addr123",
        "street": "123 شارع الجامعة",
        "city": "القاهرة",
        "state": "القاهرة",
        "postalCode": "11511",
        "isDefault": true
      }
    ]
  }
}
```

---

## 5️⃣ **Create Order (إنشاء طلب)**

### **إنشاء طلب من السلة**

```
POST http://localhost:5000/api/orders
Content-Type: application/json
```

**Body:**

```json
{
  "userId": "674c123456789",
  "shippingAddress": {
    "street": "123 شارع الجامعة",
    "city": "القاهرة",
    "state": "القاهرة",
    "postalCode": "11511"
  },
  "shippingFee": 50,
  "notes": "الرجاء الاتصال قبل التسليم"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "674d555",
    "orderNumber": "ORD-251118-4523",
    "user": {
      "_id": "674c123456789",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "01012345678"
    },
    "customerInfo": {
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "01012345678"
    },
    "shippingAddress": {
      "street": "123 شارع الجامعة",
      "city": "القاهرة",
      "state": "القاهرة",
      "postalCode": "11511"
    },
    "items": [
      {
        "product": "674a123",
        "productName": "Classic T-Shirt",
        "productImage": "/uploads/shirt1.jpg",
        "size": "L",
        "color": "White",
        "quantity": 2,
        "price": 299,
        "subtotal": 598
      }
    ],
    "totalItems": 2,
    "totalPrice": 598,
    "shippingFee": 50,
    "finalPrice": 648,
    "status": "pending",
    "notes": "الرجاء الاتصال قبل التسليم",
    "createdAt": "2025-11-18T10:30:00.000Z"
  }
}
```

> **ملاحظات:**
>
> - السلة هتتفرغ تلقائياً بعد إنشاء الطلب
> - الكميات هتتخصم من المخزون
> - الطلب هيتضاف لتاريخ طلبات المستخدم

---

## 6️⃣ **Track Orders (متابعة الطلبات)**

### **عرض طلبات المستخدم**

```
GET http://localhost:5000/api/orders/user/{user_id}
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "674d555",
      "orderNumber": "ORD-251118-4523",
      "status": "pending",
      "totalItems": 2,
      "finalPrice": 648,
      "createdAt": "2025-11-18T10:30:00.000Z"
    }
  ]
}
```

### **عرض تفاصيل طلب**

```
GET http://localhost:5000/api/orders/{order_id}
```

### **إلغاء طلب (قبل الشحن)**

```
PATCH http://localhost:5000/api/orders/{order_id}/cancel
```

---

## 👨‍💼 **Admin Operations (عمليات الأدمن)**

### **عرض كل الطلبات**

```
GET http://localhost:5000/api/orders
```

### **فلترة حسب الحالة**

```
GET http://localhost:5000/api/orders?status=pending
```

**الحالات المتاحة:**

- `pending` - في الانتظار
- `confirmed` - تم التأكيد
- `processing` - جاري التجهيز
- `shipped` - تم الشحن
- `delivered` - تم التوصيل
- `cancelled` - ملغي

### **تحديث حالة الطلب**

```
PATCH http://localhost:5000/api/orders/{order_id}/status
Content-Type: application/json
```

**Body:**

```json
{
  "status": "confirmed"
}
```

---

## 📊 **Complete User Journey Example**

### **1. تسجيل المستخدم**

```bash
POST /api/users
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01012345678"
}
# احفظ الـ user_id من الـ Response
```

### **2. تصفح المنتجات**

```bash
GET /api/products
# اختار منتج واحفظ الـ product_id
```

### **3. إضافة للسلة**

```bash
POST /api/cart/{user_id}/items
{
  "productId": "{product_id}",
  "size": "L",
  "color": "White",
  "quantity": 2
}
```

### **4. إضافة عنوان الشحن**

```bash
POST /api/users/{user_id}/addresses
{
  "street": "123 شارع الجامعة",
  "city": "القاهرة",
  "state": "القاهرة",
  "isDefault": true
}
```

### **5. إنشاء الطلب**

```bash
POST /api/orders
{
  "userId": "{user_id}",
  "shippingAddress": {
    "street": "123 شارع الجامعة",
    "city": "القاهرة",
    "state": "القاهرة"
  },
  "shippingFee": 50
}
```

### **6. متابعة الطلب**

```bash
GET /api/orders/user/{user_id}
```

---

## 🔐 **Validation Rules**

### **User:**

- Name: 3-50 characters
- Email: Valid email format
- Phone: 11 digits (Egyptian format)

### **Cart:**

- المنتج لازم يكون موجود
- المقاس لازم يكون متاح
- اللون لازم يكون من الألوان المتاحة
- الكمية لازم تكون متوفرة في المخزون

### **Order:**

- السلة مينفعش تكون فاضية
- لازم يكون فيه عنوان شحن
- الكميات لازم تكون متوفرة وقت إنشاء الطلب

---

## ⚠️ **Important Notes**

1. **Stock Management:**

   - الكميات بتتخصم من المخزون عند إنشاء الطلب
   - الكميات بترجع للمخزون عند إلغاء الطلب

2. **Cart Behavior:**

   - السلة بتتفرغ تلقائياً بعد إنشاء الطلب
   - بيتعمل cart جديد فاضي للمستخدم

3. **Order Cancellation:**

   - مينفعش تلغي طلب اتشحن أو اتوصل
   - الإلغاء بيرجع الكميات للمخزون

4. **Address Management:**
   - ممكن يكون عند المستخدم أكتر من عنوان
   - واحد بس يكون default

---

## 📋 **API Endpoints Summary**

| Endpoint                          | Method | Description             |
| --------------------------------- | ------ | ----------------------- |
| `/api/users`                      | POST   | إنشاء/الحصول على مستخدم |
| `/api/users/:id`                  | GET    | عرض بيانات مستخدم       |
| `/api/users/:id/addresses`        | POST   | إضافة عنوان             |
| `/api/cart/:userId`               | GET    | عرض السلة               |
| `/api/cart/:userId/items`         | POST   | إضافة منتج للسلة        |
| `/api/cart/:userId/items/:itemId` | PUT    | تعديل كمية              |
| `/api/cart/:userId/items/:itemId` | DELETE | حذف من السلة            |
| `/api/orders`                     | POST   | إنشاء طلب               |
| `/api/orders/user/:userId`        | GET    | طلبات المستخدم          |
| `/api/orders/:id`                 | GET    | تفاصيل طلب              |
| `/api/orders/:id/cancel`          | PATCH  | إلغاء طلب               |
| `/api/orders/:id/status`          | PATCH  | تحديث حالة (Admin)      |

---

**🚀 الـ User Module جاهز للاستخدام!**
