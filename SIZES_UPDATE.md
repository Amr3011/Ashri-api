# 📝 تحديثات المقاسات الثابتة

## ✅ التغييرات:

### 1️⃣ **المقاسات أصبحت ثابتة**

المقاسات المتاحة الآن فقط:

- **M** (Medium)
- **L** (Large)
- **XL** (Extra Large)
- **XXL** (Double XL)

### 2️⃣ **إضافة منتج جديد**

عند إضافة منتج، **المقاسات الأربعة هتتضاف تلقائياً** بكمية 0، وتقدر تحدد الكمية لكل مقاس.

**مثال:**

#### Request:

```
POST http://localhost:5000/api/products
Content-Type: multipart/form-data
```

#### Body (form-data):

```javascript
name: Classic T-Shirt
description: Comfortable cotton t-shirt
category: T-Shirt
price: 299
colors: ["White", "Black"]
sizes: [{"name": "M", "quantity": 10}, {"name": "L", "quantity": 15}]
images: [صور المنتج]
```

#### Response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "sizes": [
      { "name": "M", "quantity": 10 },
      { "name": "L", "quantity": 15 },
      { "name": "XL", "quantity": 0 }, // اتضافت تلقائياً
      { "name": "XXL", "quantity": 0 } // اتضافت تلقائياً
    ],
    "totalQuantity": 25
  }
}
```

---

### 3️⃣ **تحديث منتج (Update Product)**

عند تحديث منتج بالـ PUT، لو بعتت sizes، **فقط المقاسات اللي بعتها هتتحدث**، الباقي يفضل زي ما هو.

#### Request:

```
PUT http://localhost:5000/api/products/{product_id}
Content-Type: multipart/form-data
```

#### مثال:

**الحالة الحالية للمنتج:**

```json
{
  "sizes": [
    { "name": "M", "quantity": 10 },
    { "name": "L", "quantity": 15 },
    { "name": "XL", "quantity": 20 },
    { "name": "XXL", "quantity": 5 }
  ]
}
```

**Body (form-data):**

```
sizes: [{"name": "M", "quantity": 25}, {"name": "XL", "quantity": 30}]
```

**النتيجة:**

```json
{
  "sizes": [
    { "name": "M", "quantity": 25 }, // ✅ اتحدث
    { "name": "L", "quantity": 15 }, // ✅ زي ما هو
    { "name": "XL", "quantity": 30 }, // ✅ اتحدث
    { "name": "XXL", "quantity": 5 } // ✅ زي ما هو
  ]
}
```

---

### 4️⃣ **تحديث كمية مقاس واحد فقط (PATCH)**

دلوقتي تقدر تحدث كمية مقاس **واحد بس** بدون ما تأثر على باقي المقاسات.

#### Request:

```
PATCH http://localhost:5000/api/products/{product_id}/stock
Content-Type: application/json
```

#### Body (JSON):

```json
{
  "sizeName": "M",
  "quantity": 20
}
```

#### Response:

```json
{
  "success": true,
  "message": "Stock updated successfully for size M",
  "data": {
    "sizes": [
      { "name": "M", "quantity": 20 }, // ✅ اتحدث
      { "name": "L", "quantity": 15 }, // ✅ زي ما هو
      { "name": "XL", "quantity": 0 }, // ✅ زي ما هو
      { "name": "XXL", "quantity": 0 } // ✅ زي ما هو
    ],
    "totalQuantity": 35
  }
}
```

---

## 📋 أمثلة كاملة:

### مثال 1: إضافة منتج بدون تحديد مقاسات

```javascript
// Request Body
{
  name: "New Hoodie",
  description: "Comfortable hoodie",
  category: "Hoodie",
  price: 599,
  colors: ["Black"],
  // لو مش باعت sizes، هتتضاف الأربع مقاسات بكمية 0
}

// Response
{
  "sizes": [
    {"name": "M", "quantity": 0},
    {"name": "L", "quantity": 0},
    {"name": "XL", "quantity": 0},
    {"name": "XXL", "quantity": 0}
  ]
}
```

### مثال 2: إضافة منتج بمقاسين فقط

```javascript
// Request Body
{
  name: "Slim Jeans",
  description: "Comfortable jeans",
  category: "Jeans",
  price: 799,
  colors: ["Blue", "Black"],
  sizes: [
    {"name": "L", "quantity": 20},
    {"name": "XL", "quantity": 15}
  ]
}

// Response
{
  "sizes": [
    {"name": "M", "quantity": 0},     // اتضافت تلقائياً
    {"name": "L", "quantity": 20},
    {"name": "XL", "quantity": 15},
    {"name": "XXL", "quantity": 0}    // اتضافت تلقائياً
  ]
}
```

### مثال 3: تحديث كمية مقاس L

```json
// Request
PATCH /api/products/674b123456/stock
{
  "sizeName": "L",
  "quantity": 50
}

// Response: فقط مقاس L اتحدث، الباقي زي ما هو
```

### مثال 4: تحديث كمية مقاس XXL لصفر

```json
// Request
PATCH /api/products/674b123456/stock
{
  "sizeName": "XXL",
  "quantity": 0
}

// Response: مقاس XXL بقى 0، الباقي زي ما هو
```

---

## ⚠️ ملاحظات مهمة:

1. **المقاسات المتاحة فقط:** M, L, XL, XXL
2. **لو بعتت مقاس تاني:** هيرجع error
3. **عند التحديث:** لازم تبعت `sizeName` و `quantity`
4. **الـ totalQuantity:** بيتحسب تلقائياً من مجموع كل المقاسات

---

## 🧪 اختبار التحديثات:

### 1. إضافة منتج:

```bash
POST http://localhost:5000/api/products
# ارفع صور + البيانات
```

### 2. شوف المنتج:

```bash
GET http://localhost:5000/api/products/{product_id}
# هتلاقي الـ 4 مقاسات موجودين
```

### 3. حدث كمية مقاس واحد:

```bash
PATCH http://localhost:5000/api/products/{product_id}/stock
Body: {"sizeName": "M", "quantity": 25}
```

### 4. تأكد إن باقي المقاسات زي ما هي:

```bash
GET http://localhost:5000/api/products/{product_id}
# فقط مقاس M اتغير
```

---

## ✅ الفوائد:

1. ✅ المقاسات ثابتة ومش بتتشال
2. ✅ سهل تحديث كمية مقاس واحد
3. ✅ مش محتاج تبعت كل المقاسات عند التحديث
4. ✅ الكمية الإجمالية بتتحسب تلقائياً
5. ✅ مافيش مقاسات مكررة

---

**جاهز للاستخدام! 🚀**
