import * as RODIN from 'rodin/core';
RODIN.start();
RODIN.Scene.HMDCamera.focalLength = 10;
const POINTS = {};

function loadPoint(image_path, hotspots, point_id) {
    
    console.log(image_path);
    
    var imagePrefix = image_path;
    var directions  = ["r", "l", "u", "d", "f", "b"];
    var imageSuffix = ".jpg";
    var storiesGeometry = new THREE.CubeGeometry( 100, 100, 100 );
    
    var materialArray = [];
    for (var i = 0; i < 6; i++) {
    	materialArray.push( new THREE.MeshBasicMaterial({
    		map: RODIN.Loader.loadTexture( imagePrefix + directions[i] + imageSuffix ),
    		side: THREE.DoubleSide
    	}));
    	}
    POINTS[point_id] = {};
    
    	//console.log(materialArray);
    var storiesMaterial = new THREE.MeshFaceMaterial( materialArray );
    var storiesBox = new RODIN.Sculpt(new THREE.Mesh( storiesGeometry, storiesMaterial ));
    POINTS[point_id].materials = storiesBox;
    storiesBox.scale.set(-1,1,1);
    storiesBox.rotation.y = Math.PI;
    
    
    const exp360_scene1 = new RODIN.Sculpt();
    
    var panoHotspots = [];
    
    for(i = 0; i < hotspots.length; i++) {
        
        panoHotspots[i] = {};
        
        panoHotspots[i].id = hotspots[i].id;
        panoHotspots[i].ath = hotspots[i].ath;
        panoHotspots[i].atv = hotspots[i].atv;
        panoHotspots[i].hlookat = hotspots[i].hlookat;
        panoHotspots[i].vlookat = hotspots[i].vlookat;
        panoHotspots[i].to_id = hotspots[i].to_point.id;
        panoHotspots[i].to_id_name = hotspots[i].to_point.point_name;
        
        if(hotspots[i].custom_image == null) {
            panoHotspots[i].plane = new RODIN.Plane(5, 2.77, new THREE.MeshBasicMaterial({ map: RODIN.Loader.loadTexture("images/hotspot.png"), transparent: true }));
        }
        else {
            panoHotspots[i].plane = new RODIN.Plane(3, 3, new THREE.MeshBasicMaterial({ map: RODIN.Loader.loadTexture("images/" + hotspots[i].custom_image), transparent: true }));
            panoHotspots[i].plane.on("RODIN.CONST.READY", (e) => {
                e.target.material.map.anisotropy = 16;
                e.target.material.map.anisotropy = 16;
                
            })
        }
        
        panoHotspots[i].hotspotHolderY = new RODIN.Sculpt();
        panoHotspots[i].hotspotHolderX = new RODIN.Sculpt();
        
        panoHotspots[i].hotspotHolderY.add(panoHotspots[i].hotspotHolderX);
        exp360_scene1.add(panoHotspots[i].hotspotHolderY);
        panoHotspots[i].hotspotHolderX.add(panoHotspots[i].plane);
        panoHotspots[i].hotspotHolderY.rotation.y = -(Math.PI / 180) * hotspots[i].ath;
        panoHotspots[i].hotspotHolderX.rotation.x= -(Math.PI / 180) * hotspots[i].atv;
        panoHotspots[i].plane.position.set(0, 0, -36);
        panoHotspots[i].plane.rotation.x = -Math.PI / 5;
        
        

    }
    
    for(let f = 0; f < panoHotspots.length; f++) {
        
        panoHotspots[f].plane.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, function (evt) {
            console.log(panoHotspots);
            //panoHotspots = {};
            RODIN.Scene.remove(exp360_scene1);
            loadXMLDoc("points/" + panoHotspots[f].to_id + ".json");
        });
        
    }
    
    console.log("fresh");
    
    console.log(panoHotspots);
    console.log(POINTS);
    
    
    exp360_scene1.add(storiesBox);
    
    
        
    RODIN.Scene.add(exp360_scene1);
    //console.log(exp360_scene1);
    
}


function loadXMLDoc(query) {
    var xmlhttp = new XMLHttpRequest();
    var answer, imagePath;
    var hotspots = [];

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               //console.log(xmlhttp.responseText);
               answer = JSON.parse(xmlhttp.responseText);
               imagePath = answer.response.default_image_url;
               imagePath = imagePath.substring(0, imagePath.length - 5);
               for(var i=0;i<answer.response.spots.length;i++) {
                   hotspots.push(answer.response.spots[i]);
               }
               console.log(answer);
               console.log(hotspots);
               loadPoint(imagePath, hotspots, query);
               
           }
           else if (xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", "https://360stories.com/api/v1/points/" + query + ".json", true);
    xmlhttp.send();

}

loadXMLDoc(6778);

    