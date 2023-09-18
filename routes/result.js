module.exports = function (router) {

    function convertQuery(query){
        const res = {}
        for (const key in query){
            res[key] = JSON.parse(query[key]);
        }
        return res;
    }

    var WordleResult = require("../models/wordleresult.js");

    router.post("/results", async (req, res) => {
        const data = new WordleResult({
            number: req.body.number,
            score: req.body.score,
            hardMode: req.body.hardMode,
            date: Date.now()
        });
    
        try{
            const dataToSave = await data.save();
            res.status(201).json({message: "OK",
                            data: dataToSave});
        }
        catch(error){
            if(error.message.startsWith("WordleResult validation failed")){
                res.status(400).json({message: "Error 400 Bad Request", data: {}});
            } else{
                res.status(500).json({message: "Error 500 Internal Server Error", data: {}});
            }
        }
    });

    router.get('/results/:number', async (req, res) => {
        try{
            const data = await WordleResult.findOne({number: req.params.number}, null, convertQuery(req.query));

            if(data === null){
                res.status(404).json({message: "Error 404 Result Not Found", data: {}});
            } else {
                res.status(200).json({message: "OK",
                                      data: data});
            }
        } catch(error){
            if(error.message.startsWith("Unexpected token")){
                res.status(400).json({message: "Error 400 Bad Request", data: {}});
            } else {
                res.status(500).json({message: "Error 500 Internal Server Error", data: {}});
            }
        }
    });

    router.delete('/results/:number', async (req, res) => {
        try{
            const data = await WordleResult.findOneAndDelete({number: req.params.number});
    
            if(data === null){
                res.status(404).json({message: "Error 404 Result Not Found", data: {}});
            } else {
                res.status(200).json({message: "OK",
                                      data: data});
            }
        } catch(error){
            res.status(500).json({message: "Error 500 Internal Server Error", data: {}});
        }
    });

    router.post("/results/parsemessage", async (req, res) => {
        const message = req.body.message;

        //verify validity of wordle message
        if(!(/Wordle \d+ [123456X]\/6([\*]{0,1})[\n][\n]([🟩🟨⬛⬜]{5}){1,6}/.test(message))){
            res.status(400).json({message: "Error 400 Bad Request", data: {}});
            return;
        }

        split_message = message.split(/[\s\n]/);
        number = Number(split_message[1]);
        tries = split_message[2][0];
        hardMode = split_message[2].length === 4;
        if(tries < '1' || tries > '6'){
            tries = 7;
        } else {
            tries = Number(tries);
        }

        lines = message.split("\n");
        if(tries === 7){
            if(lines.length != 8){
                res.status(400).json({message: "Error 400 Bad Request", data: {}});
                return;
            }
            for(var i=tries-1; i>=2; i--){
                if(lines[i] === "🟩🟩🟩🟩🟩"){
                    res.status(400).json({message: "Error 400 Bad Request", data: {}});
                    return;
                }
            }
        } else {
            if(lines.length != tries+2 || lines[lines.length-1] != "🟩🟩🟩🟩🟩"){
                res.status(400).json({message: "Error 400 Bad Request", data: {}});
                return;
            }
            for(var i=tries-2; i>=2; i--){
                if(lines[i] === "🟩🟩🟩🟩🟩"){
                    res.status(400).json({message: "Error 400 Bad Request", data: {}});
                    return;
                }
            }
        }

        //once verified, add to database
        const data = new WordleResult({
            number: number,
            score: tries,
            hardMode: hardMode,
            date: Date.now()
        });
    
        try{
            const dataToSave = await data.save();
            res.status(201).json({message: "OK",
                            data: dataToSave});
        }
        catch(error){
            if(error.message.startsWith("WordleResult validation failed")){
                res.status(400).json({message: "Error 400 Bad Request", data: {}});
            } else{
                res.status(500).json({message: "Error 500 Internal Server Error", data: {}});
            }
        }
    });

    return router;
}
