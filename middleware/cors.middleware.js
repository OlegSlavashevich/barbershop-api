function cors(req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("optionsSuccessStatus", 200);
  res.header("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.send("");
  }
  next();
}

module.exports = cors;
