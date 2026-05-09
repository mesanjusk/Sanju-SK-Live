import express from 'express';
import Title from '../models/Title.js';
import { v4 as uuid } from "uuid";

const router = express.Router();

router.post('/add', async (req, res) => {
  const { name } = req.body;
   try{
        const title=await Title.findOne({ name: name })
       
        if(title){
            res.json("exist")
        }
        else{
          const newTitle = new Title({
            name,
            title_uuid: uuid()
        });
        await newTitle.save(); 
        res.json("notexist");
        }

    }
    catch(e){
      console.error("Error saving Title:", e);
      res.status(500).json("fail");
    }

});

 router.get("/GetTitleList", async (req, res) => {
    try {
      let data = await Title.find({});
  
      if (data.length)
        res.json({ success: true, result: data.filter((a) => a.name) });
      else res.json({ success: false, message: "Title Not found" });
    } catch (err) {
      console.error("Error fetching Title:", err);
        res.status(500).json({ success: false, message: err });
    }
  });

export default router;
