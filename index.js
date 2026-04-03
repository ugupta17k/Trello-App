const express = require("express");
const jwt = require("jsonwebtoken");
const { authmiddleware } = require("./middleware");

const app = express();

app.use(express.json());

let userId = 1;
let OrgId = 1;
let boardId = 1;
let IssueId = 1;

const Users = [];
const orgs = [];
const boards = [];
const issues = [
  {
    id: "1",
    title: "first issue",
    bordId: "1",
  },
];

app.post("/signup", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const userExist = Users.find((user) => user.username === username);
  if (userExist) {
    res.status(403).send({
      message: "User already exist",
    });
    return;
  }
  Users.push({
    username,
    password,
    id: userId++,
  });
  res.json({
    message: "Sign up done!",
  });
  console.log(Users);
});

app.post("/signin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const userExist = Users.find(
    (users) => users.username === username && users.password === password,
  );
  if (!userExist) {
    res.status(403).send({
      message: "User not found",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: userExist.id,
    },
    "ujjwalg29",
  );

  res.json({
    token,
  });
});

app.post("/organisation", authmiddleware, function (req, res) {
  const userId = req.userId;
  const orgTitle = req.body.orgTitle;
  const orgDesc = req.body.orgDesc;

  console.log(userId);

  orgs.push({
    id: OrgId++,
    Title: orgTitle,
    description: orgDesc,
    admin: userId,
    members: [],
  });
  res.json({
    message: "Org created successfully",
    orgs,
  });
  // console.log(orgs);
});

app.post("/Add-OrgsMembers", authmiddleware, function (req, res) {
  const userId = req.userId;
  const orgId = Number(req.body.OrgId);
  const memberUsername = req.body.memberUsername;

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }

  if (OrgExist.admin !== userId) {
    res.status(403).send({
      message: "You are not admin of this org",
    });
    return;
  }

  const usernameExist = Users.find((u) => u.username === memberUsername);
  if (!usernameExist) {
    res.status(403).send({
      message: "User is not found, add existing user",
    });
    return;
  }

  // console.log(OrgExist);

  OrgExist.members.push(usernameExist.id);
  res.json({
    message: "User added",
    members: OrgExist.members,
  });
});

app.post("/board", authmiddleware, function (req, res) {
  const userId = req.userId;
  const boardTitle = req.body.boardTitle;
  const orgId = Number(req.body.OrgId);

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }

  if (OrgExist.admin !== userId) {
    res.status(403).send({
      message: "You are not admin of this org",
    });
    return;
  }

  boards.push({
    id: boardId++,
    title: boardTitle,
    orgId: orgId,
  });

  res.json({
    message: "board created Successfully",
    boards,
  });
});

app.get("/board", authmiddleware , function(req , res){

  const userId = req.userId;
  const orgId = Number(req.query.OrgId);
  // const memberUsername = req.body.memberUsername;

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }


  if (OrgExist.admin !== userId && !OrgExist.members.includes(userId)) {
    res.status(403).send({
      message: "You are not admin or member of this org",
    });
    return;
  }
  const orgboards = boards.filter((board) => board.orgId === orgId);

  res.json({
    boards:orgboards,
      members:OrgExist.members.map(memberId =>{
        const user = Users.find(u => u.id === memberId)
        return{
          id: user.id , 
          username : user.username
        }
      })
  })
})

app.get("/organisation", authmiddleware, function (req, res) {
  const userId = req.userId
  const orgId = Number(req.query.OrgId);

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }

  if (OrgExist.admin !== userId) {
    res.status(403).send({
      message: "You are not admin of this org",
    });
    return;
  }

  res.json({
    OrgExist:{
      ...OrgExist,
      members:OrgExist.members.map(memberId =>{
        const user = Users.find(u => u.id === memberId)
        return{
          id: user.id , 
          username : user.username
        }
      })
    }
  })
});

app.post("/issues", authmiddleware, function (req, res) {
  const IssueTitle = req.body.IssueTitle
  const userId = req.userId;
  const boardId = Number(req.body.boardId);
  const orgId = Number(req.body.OrgId);

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }

  if (OrgExist.admin !== userId) {
    res.status(403).send({
      message: "You are not admin of this org",
    });
    return;
  }

  const boardExist = boards.find((board) => board.id === boardId);
  if (!boardExist) {
    res.status(403).send({
      message: "Board is not existed",
    });
    return;
  }

  issues.push({
    id: IssueId++,
    title: IssueTitle,
    boardId:Number(boardId),
  });

  res.json({  
    message: "Issues created Successfully",
    issues,
  });
});

app.get("/issues", authmiddleware, function (req, res) {
  const userId = req.userId;
  const orgId = Number(req.query.OrgId);
  const boardId = Number(req.query.boardId);

  const OrgExist = orgs.find((org) => org.id === orgId);
  if(!OrgExist) {
    res.status(403).send({
      message: "Org is not existed",
    });
    return;
  }

  if (OrgExist.admin !== userId && !OrgExist.members.includes(userId)) {
    res.status(403).send({
      message: "You are not admin or member of this org",
    });
    return;
  }
  
  const boardExist = boards.find((board) => board.id === boardId);
  if (!boardExist) {
    res.status(403).send({
      message: "Board is not existed",
    });
    return;
  }
  if (boardExist.orgId !== orgId) {
    return res.status(403).send({
      message: "Board does not belong to this org",
    });
  }

  const boardissues = issues.filter(issue => issue.boardId === boardId);
  res.json({    
    issues:boardissues,
    members:OrgExist.members.map(memberId =>{
      const user = Users.find(u => u.id === memberId)
      return{
        id: user.id , 
        username : user.username
      }
    })
  })
});

app.delete("/Delete-orgsMember", authmiddleware, function (req ,res) {
  const userId = req.userId;
  const orgId = parseInt(req.query.OrgId);
  const memberUserId = parseInt(req.query.memberUserId);

  const OrgExist = orgs.find((org) => org.id === orgId);
  if (!OrgExist || OrgExist.admin !== userId) {
    res.status(403).send({
      message: "org not found or user is not an admin",
    });
    return;
  }

  const UserIdExist = Users.find((u) => u.id === memberUserId);
    if (!UserIdExist) {
      res.status(403).send({
      message: "No member user found to delete",
      });
      return;
    }

  // OrgExist.members stores user ids (numbers)
  OrgExist.members = OrgExist.members.filter((memberId) => memberId !== UserIdExist.id);

  res.json({
    message:"Member deleted"
  })
  console.log(OrgExist.members);
  
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Frontend/index.html");
});
app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/Frontend/signup.html");
});
app.get("/signin", function (req, res) {
  res.sendFile(__dirname + "/Frontend/signin.html");
});
app.get("/organisation", function (req, res) {
  res.sendFile(__dirname + "/Frontend/organisation.html");
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});


// module.exports = {
//   orgs
// }
