const app = require('./app');
const {PORT} = process.env;


app.listen(process.env.PORT, ()=>console.log(`Server is running at port:${PORT}`));