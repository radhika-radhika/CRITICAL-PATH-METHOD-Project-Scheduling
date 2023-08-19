var data = {}

function addTask()
{
    var InputName = document.getElementById("InputName").value
    var InputPredecessorName = document.getElementById("InputPredecessorName").value
    if(InputPredecessorName==="")
    {
        InputPredecessorName = []
    }
    else
    {
        InputPredecessorName = InputPredecessorName.split(",");
    }
    var InputDuration = document.getElementById("InputDuration").value

    data[InputName] = {
        "Predecessor":InputPredecessorName,
        "Duration":InputDuration,
        "es":undefined,
        "ef":undefined,
        "ls":undefined,
        "lf":undefined,
        "float":undefined,
        "Successor":[]
    }

    generateTable();

    document.getElementById("InputName").value = "";
    document.getElementById("InputPredecessorName").value = "";
    document.getElementById("InputDuration").value = "";

    console.log(data)
}


function generateTable() {
    // creates a <table> element and a <tbody> element
    const tbl = document.createElement("table");
    const tblBody = document.createElement("tbody");

    const row = document.createElement("tr");

    const cell1 = document.createElement("td");
    const cellText1 = document.createTextNode("TASK");
    cell1.appendChild(cellText1);
    row.appendChild(cell1);

    const cell2 = document.createElement("td");
    const cellText2 = document.createTextNode("DURATION");
    cell2.appendChild(cellText2);
    row.appendChild(cell2);

    const cell3 = document.createElement("td");
    const cellText3 = document.createTextNode("PRECEDENCE");
    cell3.appendChild(cellText3);
    row.appendChild(cell3);

    tblBody.appendChild(row);

    for (var [i,value] of Object.entries(data)) {
      // creates a table row
      const row = document.createElement("tr");

        const cell1 = document.createElement("td");
        const cellText1 = document.createTextNode(i);
        cell1.appendChild(cellText1);
        row.appendChild(cell1);

        const cell2 = document.createElement("td");
        const cellText2 = document.createTextNode(data[i]["Duration"]);
        cell2.appendChild(cellText2);
        row.appendChild(cell2);

        const cell3 = document.createElement("td");
        const cellText3 = document.createTextNode(data[i]["Predecessor"]);
        cell3.appendChild(cellText3);
        row.appendChild(cell3);

      // add the row to the end of the table body
      tblBody.appendChild(row);
    }

    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    // appends <table> into <body>

    document.getElementById("table").innerHTML = "";
    document.getElementById("table").appendChild(tbl)
    // document.body.appendChild(tbl);
    // sets the border attribute of tbl to '2'
    tbl.setAttribute("border", "2");
}


function calculate(data)
{
    document.getElementById("cpm").innerText = ""
    document.getElementById("time").innerText = ""
    document.getElementById("graph").innerText = ""
    var flow =[];
    var criticalTime = 0;

    // ------------------------------------------------------------------------------------------------------------------
    // flow = findFlow(data)

    var copyData = {};

    for(var [key,value] of Object.entries(data))
    {
        copyData[key] = {};

        for(var [k,v] of Object.entries(value))
        {
            if(k==="Predecessor")
            {
                copyData[key][k] = [...v];
            }
            else{
                copyData[key][k] = v;
            }
        }

    }

    while(Object.keys(copyData).length!=0)
    {
        var initial_length = Object.keys(copyData).length;

        for (const [key, value] of Object.entries(copyData)) {
            if(value["Predecessor"].length == 0)
            {
                flow.push(key);
                // delete the key,value entry
                delete copyData[key];
                // delete the presence of key in other values
                for (const [k, v] of Object.entries(copyData)) {
                    const index = v["Predecessor"].indexOf(key);
                    if (index > -1)
                    {
                        v["Predecessor"].splice(index, 1); // 2nd parameter means remove one item only
                    }
                }

                break;
            }
        }
        if(Object.keys(copyData).length==initial_length){
          document.getElementById("error").innerText = "Error graph";
          return;
        }
    }

    console.log("found flow",flow,data)
    // ---------------------------------------------------------------------------------------------------------------------
    // [data,criticalTime] = forwardCPM(flow,data,criticalTime)

    for(var t of flow)
    {
        if(data[t]["Predecessor"].length===0)
        {
            data[t]["es"] = 0;
            data[t]["ef"] = data[t]["Duration"];
        }
        else {
            var time = 0;
            for(var p of data[t]["Predecessor"])
            {
                time = Math.max(time,data[p]["ef"])
            }
            data[t]["es"] = time;
            data[t]["ef"] = parseInt(time) + parseInt(data[t]["Duration"])
        }
        criticalTime = Math.max(criticalTime,data[t]["ef"])
    }

    console.log("found ForwardCPM")
    console.log(data,flow,criticalTime)
    //  --------------------------------------------------------------------------------------------------------------------
    // BackwardCPM(data,criticalTime)

    for(const [t,value] of Object.entries(data))
    {
        for(var p of data[t]["Predecessor"])
        {
            data[p]["Successor"].push(t);
        }
    }

    for(var t of flow.reverse())
    {
        if(data[t]["Successor"].length===0)
        {
            data[t]["ls"] = criticalTime - data[t]["Duration"];
            data[t]["lf"] = criticalTime;
        }
        else {
            var time = criticalTime;
            for(var p of data[t]["Successor"])
            {
                time = Math.min(time,data[p]["ls"])
            }
            data[t]["lf"] = time;
            data[t]["ls"] = time - data[t]["Duration"]
        }
        data[t]["float"] = data[t]["ls"] - data[t]["es"]
    }

    console.log("found BackwardCPM",data)
    // -----------------------------------------------------------------------------------------------------------------------------
    // appendGraph(data)
    var noPredecessor = [];
    var noSuccessor = [];

    for(const[k,v] of Object.entries(data))
    {
        if(v["Predecessor"].length==0)
        {
            noPredecessor.push(k);
        }
        if(v["Successor"].length==0)
        {
            noSuccessor.push(k);
        }
    }

    var indices = {"Start":0};
    indices["Finish"] = Object.keys(data).length + 1;

    var index = 1;
    var nodesList = [];
    var red = "#fc87cc";

    for(var [t,value] of Object.entries(data))
    {
        indices[t] = index;
        if(data[t]["float"]==0)
            color = red;
        else
            color= "#4ba3c3";

        nodesList.push({id: index,"color":color, label: data[t]["es"]+"  |  "+data[t]["Duration"]+"  |  "+data[t]["ef"]+"\n----------------\n    "+t+"    \n----------------\n"+data[t]["ls"]+"  |  "+data[t]["float"]+"  |  "+data[t]["lf"]})

        index++;
    }
    nodesList.push({id: 0, label: "Start",color:red,x:100,y:0});
    nodesList.push({id: indices["Finish"], label: "Finish",color:red,x:100,y:100});



    var edgesList = [];

    for(var [key,value] of Object.entries(data)){

        for(var s of value["Successor"])
        {
            edgesList.push({ from: indices[key],to: indices[s],length:500})
        }
    }

    for(var np of noPredecessor)
    {
        edgesList.push({ from: 0,to: indices[np]})
    }

    for(var ns of noSuccessor)
    {
        edgesList.push({ from: indices[ns],to: indices["Finish"],smooth: "vee",})
    }


    console.log(indices,nodesList,edgesList)

    var nodes = new vis.DataSet(nodesList);

    // create an array with edges
    var edges = new vis.DataSet(edgesList);

    var options = {
        // layout: { randomSeed: 2 },
        nodes: {
            shape: "box",
          },
      };

    // create a network
    var container = document.getElementById("graph");
    var datum = {
        nodes: nodes,
        edges: edges,
    };
    var options = {};
    var network = new vis.Network(container, datum, options);

    console.log("appended graph")

    var cp = "Critical Path is:  Start -->";
    for(var t of flow.reverse())
    {
        if(data[t]["float"]==0)
            cp= cp + t + "-->"
    }
    cp = cp + "Finish";
    console.log(cp)
    document.getElementById("cpm").innerText = cp

    document.getElementById("time").innerText = "Total time taken is : " + criticalTime;

    // ------------------------------------------------------------------------------------------------------

}
