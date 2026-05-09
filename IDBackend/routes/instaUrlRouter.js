import express from 'express';
import Instaurl from '../models/InstaUrl.js';
import { v4 as uuid } from "uuid";

const router = express.Router();

router.post('/add', async (req, res) => {
  const { name } = req.body;
   try{
        const title=await Instaurl.findOne({ name: name })
       
        if(title){
            res.json("exist")
        }
        else{
          const newTitle = new Instaurl({
            name,
            instaUrl_uuid: uuid()
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

 router.get("/GetInstaList", async (req, res) => {
    try {
      let data = await Instaurl.find({});
  
      if (data.length)
        res.json({ success: true, result: data.filter((a) => a.name) });
      else res.json({ success: false, message: "URL Not found" });
    } catch (err) {
      console.error("Error fetching URL:", err);
        res.status(500).json({ success: false, message: err });
    }
  });

export default router;
