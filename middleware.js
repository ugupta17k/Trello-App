const jwt = require("jsonwebtoken");
// const {orgs} = require('./index')

function authmiddleware(req, res, next) {
  const token = req.headers.token;
  if (!token) {
    res.status(403).send({
      message: "Token not found",
    });
    return;
  }
  let decode;
  try {
    decode = jwt.verify(token, "ujjwalg29");
  } catch (error) {
    res.status(403).send({
      message: "Invalid token",
    });
    return;
  }

  const userId = decode.userId;
  if (!userId) {
    res.status(403).send({
      message: "Userid not found",
    });
    return;
  }
  req.userId = userId;
  next();
}
// function OrgMiddleware(req, res, next) {

//   const orgId = Number(req.body.OrgId);
//   const OrgExist = orgs.find(org => org.id === orgId);
//   if (!OrgExist) {
//     res.status(403).send({
//       message: "Org is not existed",
//     });
//     return;
//   }

//   if (OrgExist.admin !== userId) {
//     res.status(403).send({
//       message: "You are not admin of this org",
//     });
//     return;
//   }
//   req.orgId = orgId
//   next();
// }

module.exports = {
  authmiddleware
};
