const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Shop API",
      description: "Backend Api",
      contact: {
        name: "Amazing Developer",
      },
      servers: "http://localhost:3600",
    },
  },
  apis: ["app.js", ".routes/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "DELETE", "PATCH", "POST"],
    allowedHeaders:
      "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  })
);
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Import Routes
const adminOrdersRouter = require("./routes/adminOrders");
const adminIngredientsRouter = require("./routes/adminIngredients");
const userRoute = require("./routes/users");
const ingredientsRoute = require("./routes/ingredients");
const categoriesRoute = require("./routes/categories");
const orderRoute = require("./routes/orders");
const reviewRoute = require("./routes/orderreviews");
const customizationRoute = require("./routes/ordercustamization");
const authenticateRoute = require("./routes/authenticate");


app.use("/admin/orders",adminOrdersRouter);
app.use("/admin/ingredients", adminIngredientsRouter);
app.use("/api", userRoute);
app.use("/api", ingredientsRoute);
app.use("/api", categoriesRoute);
app.use("/api", orderRoute);
app.use("/api", reviewRoute);
app.use("/api", customizationRoute);
app.use("/api", authenticateRoute);

module.exports = app;
