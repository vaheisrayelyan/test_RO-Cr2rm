import * as RODIN from 'rodin/core';
RODIN.start();
RODIN.Scene.HMDCamera.focalLength = 10;
const POINTS = {};

function deleteHotspots() {
    
}

function loadHotspots() {
    
}

function loadPoint(image_path, hotspots, point_id) {
    
    var imagePrefix = image_path;
    var directions  = ["r", "l", "u", "d", "f", "b"];
    var imageSuffix = ".jpg";
    var storiesGeometry = new THREE.CubeGeometry( 100, 100, 100 );
    
    var materialArray = [];
    for (let i = 0; i < 6; i++) {
    	materialArray.push( new THREE.MeshBasicMaterial({
    		map: RODIN.Loader.loadTexture( imagePrefix + directions[i] + imageSuffix ),
    		side: THREE.DoubleSide
    	}));
    }
    POINTS[point_id] = {};
    let storiesMaterial = new THREE.MeshFaceMaterial( materialArray );
    let storiesBox = new RODIN.Sculpt(new THREE.Mesh( storiesGeometry, storiesMaterial ));
    POINTS[point_id].box = storiesBox;
    storiesBox.scale.set(-1,1,1);
    storiesBox.rotation.y = Math.PI;
    const exp360_scene1 = new RODIN.Sculpt();
    POINTS[point_id].hotspots = [];
    
    for(let i = 0; i < hotspots.length; i++) {
        
        POINTS[point_id].hotspots[i] = {};
        
        POINTS[point_id].hotspots[i].id = hotspots[i].id;
        POINTS[point_id].hotspots[i].ath = hotspots[i].ath;
        POINTS[point_id].hotspots[i].atv = hotspots[i].atv;
        POINTS[point_id].hotspots[i].hlookat = hotspots[i].hlookat;
        POINTS[point_id].hotspots[i].vlookat = hotspots[i].vlookat;
        POINTS[point_id].hotspots[i].to_id = hotspots[i].to_point.id;
        POINTS[point_id].hotspots[i].to_id_name = hotspots[i].to_point.point_name;
        
        if(hotspots[i].custom_image == null) {
            POINTS[point_id].hotspots[i].plane = new RODIN.Plane(5, 2.77, new THREE.MeshBasicMaterial({ map: RODIN.Loader.loadTexture("images/hotspot.png"), transparent: true }));
        }
        else {
            POINTS[point_id].hotspots[i].plane = new RODIN.Plane(3, 3, new THREE.MeshBasicMaterial({ map: RODIN.Loader.loadTexture("images/" + hotspots[i].custom_image), transparent: true }));
            POINTS[point_id].hotspots[i].plane.on("RODIN.CONST.READY", (e) => {
                e.target.material.map.anisotropy = 16;
                e.target.material.map.anisotropy = 16;
                
            })
        }
        
        POINTS[point_id].hotspots[i].hotspotHolderY = new RODIN.Sculpt();
        POINTS[point_id].hotspots[i].hotspotHolderX = new RODIN.Sculpt();
        
        POINTS[point_id].hotspots[i].hotspotHolderY.add(POINTS[point_id].hotspots[i].hotspotHolderX);
        exp360_scene1.add(POINTS[point_id].hotspots[i].hotspotHolderY);
        POINTS[point_id].hotspots[i].hotspotHolderX.add(POINTS[point_id].hotspots[i].plane);
        POINTS[point_id].hotspots[i].hotspotHolderY.rotation.y = -(Math.PI / 180) * hotspots[i].ath;
        POINTS[point_id].hotspots[i].hotspotHolderX.rotation.x= -(Math.PI / 180) * hotspots[i].atv;
        POINTS[point_id].hotspots[i].plane.position.set(0, 0, -36);
        POINTS[point_id].hotspots[i].plane.rotation.x = -Math.PI / 5;
        
        

    }
    
    for(let f = 0; f < POINTS[point_id].hotspots.length; f++) {
        
        POINTS[point_id].hotspots[f].plane.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, function (evt) {
            RODIN.Scene.remove(exp360_scene1);
            loadXMLDoc(POINTS[point_id].hotspots[f].to_id);
        });
        
    }
    
    console.log(POINTS);
    
    RODIN.messenger.once(RODIN.CONST.ALL_SCULPTS_READY, ()=> {
        exp360_scene1.add(storiesBox);
        RODIN.Scene.add(exp360_scene1);
    });
    
}


function loadXMLDoc(query) {
    var xmlhttp = new XMLHttpRequest();
    var answer, imagePath;
    var hotspots = [];

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               answer = JSON.parse(xmlhttp.responseText);
               imagePath = answer.response.default_image_url;
               imagePath = imagePath.substring(0, imagePath.length - 5);
               for(var i=0;i<answer.response.spots.length;i++) {
                   hotspots.push(answer.response.spots[i]);
               }
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

    