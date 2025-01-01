/* eslint-disable no-undef */
const app = require("./app");
const PORT = process.env.PORT || 3000; // Changed port to 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
