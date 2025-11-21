# Anonymous Checkout Flow 🛒

## النظام الجديد - Anonymous Shopping Cart

**لا يوجد تسجيل أو login للمستخدمين!**
أي حد يقدر يشتري مباشرة بدون عمل حساب

---

## كيف يعمل النظام؟

### 1️⃣ إنشاء Cart جديدة

أي customer لما يدخل الموقع، نعمله cart جديدة ونديله `sessionId`

**Request:**

```http
POST /api/cart
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "message": "Cart created successfully",
  "data": {
    "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "cart": {
      "_id": "...",
      "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
      "items": [],
      "totalItems": 0,
      "totalPrice": 0,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**⚠️ مهم:** احفظ الـ `sessionId` في الـ frontend (localStorage أو cookies)

---

### 2️⃣ إضافة منتج للـ Cart

**Request:**

```http
POST /api/cart/{sessionId}/items
Content-Type: application/json

{
  "productId": "65a7b8c9d0e1f2a3b4c5d6e7",
  "size": "L",
  "color": "أسود",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "...",
    "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "items": [
      {
        "_id": "...",
        "product": {
          "_id": "65a7b8c9d0e1f2a3b4c5d6e7",
          "name": "Sweatshirt أسود",
          "price": 500,
          "images": ["..."]
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

### 3️⃣ عرض الـ Cart

**Request:**

```http
GET /api/cart/{sessionId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "items": [...],
    "totalItems": 2,
    "totalPrice": 1000
  }
}
```

---

### 4️⃣ تعديل الكمية

**Request:**

```http
PUT /api/cart/{sessionId}/items/{itemId}
Content-Type: application/json

{
  "quantity": 3
}
```

---

### 5️⃣ حذف منتج من الـ Cart

**Request:**

```http
DELETE /api/cart/{sessionId}/items/{itemId}
```

---

### 6️⃣ إتمام الطلب (Checkout) 🎯

**هنا بيدخل بيانات العميل مباشرة!**

**Request:**

```http
POST /api/orders
Content-Type: application/json

{
  "sessionId": "a7b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "phone": "01234567890",
  "streetAddress": "15 شارع الجامعة",
  "city": "القاهرة",
  "state": "القاهرة",
  "notes": "من فضلك اتصل قبل التوصيل",
  "shippingFee": 50
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "orderNumber": "ORD-240115-0001",
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "phone": "01234567890",
    "streetAddress": "15 شارع الجامعة",
    "city": "القاهرة",
    "state": "القاهرة",
    "items": [...],
    "totalPrice": 1000,
    "shippingFee": 50,
    "finalPrice": 1050,
    "status": "pending",
    "notes": "من فضلك اتصل قبل التوصيل",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**✅ بعد إتمام الطلب:**

- الـ Cart بتتمسح تلقائياً
- الكمية بتنقص من الـ stock
- Order بيتحفظ في الداتابيز

---

## تتبع الطلبات

### البحث عن طلباتك بالإيميل أو التليفون

**Request:**

```http
GET /api/orders/search?email=ahmed@example.com
# أو
GET /api/orders/search?phone=01234567890
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "orderNumber": "ORD-240115-0001",
      "status": "delivered",
      "finalPrice": 1050,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

---

### عرض تفاصيل طلب معين

**Request:**

```http
GET /api/orders/{orderId}
```

---

### إلغاء طلب

**Request:**

```http
PATCH /api/orders/{orderId}/cancel
```

**⚠️ ملحوظة:** مينفعش تلغي طلب لو تم شحنه أو توصيله

---

## حالات الطلب (Order Status)

- `pending` - في الانتظار (بعد الإنشاء مباشرة)
- `confirmed` - تم التأكيد
- `processing` - جاري التجهيز
- `shipped` - تم الشحن
- `delivered` - تم التوصيل ✅
- `cancelled` - ملغي ❌

---

## الحقول المطلوبة عند الطلب

### إجباري:

- `sessionId` - رقم الجلسة
- `firstName` - الاسم الأول
- `lastName` - اسم العائلة
- `email` - البريد الإلكتروني
- `phone` - رقم التليفون
- `streetAddress` - العنوان بالتفصيل
- `city` - المدينة
- `state` - المحافظة

### اختياري:

- `notes` - ملاحظات للطلب
- `shippingFee` - مصاريف الشحن (default: 0)

---

## Frontend Implementation Tips

### LocalStorage Pattern

```javascript
// عند فتح الموقع
let sessionId = localStorage.getItem("cart_session_id");

if (!sessionId) {
  // إنشاء cart جديدة
  const response = await fetch("/api/cart", { method: "POST" });
  const data = await response.json();
  sessionId = data.data.sessionId;
  localStorage.setItem("cart_session_id", sessionId);
}

// استخدام sessionId في كل الطلبات
```

### Checkout Form

```javascript
const checkoutData = {
  sessionId: localStorage.getItem("cart_session_id"),
  firstName: document.getElementById("firstName").value,
  lastName: document.getElementById("lastName").value,
  email: document.getElementById("email").value,
  phone: document.getElementById("phone").value,
  streetAddress: document.getElementById("address").value,
  city: document.getElementById("city").value,
  state: document.getElementById("state").value,
  notes: document.getElementById("notes").value || "",
  shippingFee: 50,
};

const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(checkoutData),
});
```

---

## الفرق بين النظام القديم والجديد

### ❌ النظام القديم (WRONG):

1. تسجيل مستخدم جديد
2. Login
3. إضافة للـ Cart
4. Checkout

### ✅ النظام الجديد (CORRECT):

1. إنشاء Cart (تلقائي) → احصل على sessionId
2. تصفح وإضافة منتجات
3. Checkout مباشرة (إدخال البيانات في النموذج)
4. انتهى! 🎉

---

**📝 ملاحظة:** كل العمليات public ومش محتاجة authentication!
