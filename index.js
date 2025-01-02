import "dotenv/config";
import connectDB from "./src/db/connectDB.js";
import { app } from "./src/app.js";

connectDB()
.then(() => {
    // error losten
    app.on( "error" ,(error) => {
        console.log("Error", error);
        throw error;
    })
    // 
    app.listen(process.env.PORT || 8080, () =>
      console.log(`Server is running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log("Mongo DB connection failed:", err));
