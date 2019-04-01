// Golbal variables used in this program:
// Scene:
var container,
camera, 
scene, 
raycaster, 
renderer

// Events:
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED
var radius = 100, 
theta = 0

// Objects:
var spaceship = null, 
spaceshipCollider = null,
land = null,
building = null,
robot = null,
bullet = null

var buildings = []
var buildingBox = []
var buildingSpawn = []
var buildingMap = [] 

var robots = []
var robotBox = []
var robotSpawn = []
var robotMap = [] 

var bullets = []
var bulletCollider = null

// Game Configuration:
var extraTime = 0 //extra spawn time
var minTime = 1 //min spawn time
var currentTime = Date.now()
var animation = "run"
var tag = null
var animator = null
var score = 0
var stamina = 0
var reset = null
var count = 0
var grass = "images/Ground.jpg"
var sky = "images/Background.jpg"
var post = "images/post.jpg"
var speed = 1
var ufoSpeed = .9
var start = false
var pause = false
var msd = 50 //minimum spawn distance
var orbitControls = null
var duration = 5


function spawnTime(){ return Math.random() * minTime + extraTime }
function firstSpawn(){ return Math.random() }

// Ground:
async function createLand(y){  
    // Create a texture map
    var map = new THREE.TextureLoader().load(grass)
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.set(8, 8)

    // Put in a ground spaceship to show off the lighting
    geometry = new THREE.PlaneGeometry(100, 100, 50, 50)
    land = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}))

    land.position.set(0, -5, 0)
    land.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(0), 0)
    
    // Add the mesh to our group
    scene.add( land )
    land.castShadow = false
    land.receiveShadow = true
}
function landAnimation(obj){if (obj){
    landAnimator = new KF.KeyFrameAnimator
    landAnimator.init({ 
        interps:[{ 
                    keys:[0, 1], 
                    values:[
                            { x : 0, y : 0 },
                            { x : 0, y : 1 },
                            ],
                    target:obj.material.map.offset
                },
            ],
        loop: true,
        duration: 900
    })
    landAnimator.start()}
}
function fireAnimation(obj){
    var fireAnimator = new KF.KeyFrameAnimator
    fireAnimator.init({
        interps:
            [
                {
                    keys:[0, 1],
                    values:[
                            { z : obj.position.z + 0},
                            { z : obj.position.z - 100}
                            ],
                    target:obj.position
                },
            ],
        loop: false,
        duration:duration * 500,
    })
    fireAnimator.start()
    return fireAnimator
}

// Loading the player:
async function loadSpaceship(){
    var mtlLoader = new THREE.MTLLoader()
    mtlLoader.load( "objects/Spaceship/SpaceshipMTL.mtl", function( materials ) {
    materials.preload()
    var loader = new THREE.OBJLoader()
    loader.setMaterials(materials)
    loader.load("objects/Spaceship/SpaceshipOBJ.obj",
        function ( object ) {
            object.material = new THREE.MeshPhongMaterial({ map:0xf919191})
            object.position.set(0,0,0)
            object.scale.set(.1, .1, .1)
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(-90), THREE.Math.degToRad(0))
            scene.add(object)
            spaceship = object
        },
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) },
    function ( error ) { console.log( 'Error loading spaceship' ) }
    )
    })
}

// Loading buildings
async function loadBuilding(){
    var mtlLoader = new THREE.MTLLoader()
    mtlLoader.load( "objects/Building/BuildingMTL.mtl", function( materials ) {
    materials.preload()
    var loader = new THREE.OBJLoader()
    loader.setMaterials(materials)
    loader.load("objects/Building/BuildingOBJ.obj",
        function ( object ){
            object.material = new THREE.MeshPhongMaterial({ map:0xf0f0f0})
            object.scale.set(.05, .1, .05)
            object.position.set(Math.floor(Math.random() * 15) + 1, -800, 800)
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0))
            //scene.add(object)
            buildings.push(object)
            buildingBox.push(new THREE.Box3().setFromObject(object))
            buildingSpawn.push(firstSpawn())
            buildingMap.push(false)

            for (var i = 0; i <= 4; i++)
                {
                    posx = Math.floor(Math.random() * 20) + 1
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1
                    building = object.clone()
                    building.position.set(posx, -8 , 8)
                    scene.add(building)
                    buildings.push(building)
                    tempCol = new THREE.Box3().setFromObject(building)
                    buildingBox.push(tempCol)
                    buildingSpawn.push(firstSpawn())
                    buildingMap.push(false)

                }
        },
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) },
    function ( error ) { console.log( 'An error happened' )}
    )
    })
}

// Enemies:
async function loadRobot(){
    var mtlLoader = new THREE.MTLLoader()
    mtlLoader.load( "objects/UFO/ufo.mtl", function( materials ) {
    materials.preload()
    var loader = new THREE.OBJLoader()
    loader.setMaterials(materials)
    loader.load("objects/UFO/ufo.obj",
        function ( object ){
            object.material = new THREE.MeshPhongMaterial({ map:0xf0f0f0})
            object.scale.set(.1, .1, .1)
            object.position.set(Math.floor(Math.random() * 15) + 1, -1, 18)
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0))
            scene.add(object)
            robots.push(object)
            robotBox.push(new THREE.Box3().setFromObject(object))
            robotSpawn.push(firstSpawn())
            robotMap.push(false)

            for (var i = 0; i <= 4; i++)
                {
                    posx = Math.floor(Math.random() * 20) + 1
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1
                    posy = Math.floor(Math.random() * 20) + 1
                    posy *= Math.floor(Math.random()*2) == 1 ? 1 : -1
                    robot = object.clone()
                    robot.position.set(posx, posy , 8)
                    scene.add(robot)
                    robots.push(robot)
                    tempCol = new THREE.Box3().setFromObject(robot)
                    robotBox.push(tempCol)
                    robotSpawn.push(firstSpawn())
                    robotMap.push(false)

                }
        },
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) },
    function ( error ) { console.log( 'An error happened' )}
    )
    })
}

async function loadBullet(){
    var loader = new THREE.OBJLoader()
    loader.load("objects/Bullet.obj",
        function ( object ){
            object.material = new THREE.MeshPhongMaterial({ map:0xf919191})
            object.position.set(0, 100, 0)
            object.scale.set(1, 1, 1)
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0))
            scene.add(object)
            bullet = object
            bulletCollider = new THREE.Box3().setFromObject(object)
        },
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) },
    function ( error ) { console.log( 'An error happened' )}
    )
}

function fire(position){
    var clone = bullet.clone()
    clone.position.set(position.x, position.y, position.z)
    clone.box = new THREE.Box3()
    clone.firethis = fireAnimation(clone)
    bullets.push(clone)
    scene.add(clone)
}

async function createScene(canvas) {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } )
    renderer.setSize(window.innerWidth, window.innerHeight)
    scene = new THREE.Scene()
    scene.background = new THREE.TextureLoader().load(sky)

    // Camera:
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 )
    camera.position.set(0, 0, 10)
    camera.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0))
    scene.add(camera)

    // Lights:
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 )
    light.position.set( 0, 15, 25 )
    scene.add( light )

    // Functions:
    await loadSpaceship()
    await createLand(0)
    await loadBuilding()
    await loadRobot()
    await loadBullet()


    stamina = 100

    landAnimation(land)

    score_l = $("#score")
    reset = $("#reset")
    startB = $("#start")
    title = $("#title")
    staminaL = $("#stamina")
    result = $("#result")

    startB.removeClass("hidden")
    title.removeClass("hidden")

    $("#start").click(() =>{
        start = true
        score = 0
        startB.addClass("hidden")
        title.addClass("hidden")
        score_l.text("Score: 0")
    })

    $("#reset").click(() =>{
        score = 0
        reset.addClass("hidden")
        score_l.text("Score: 0")
        location.reload()
    })

    document.addEventListener('keydown', onDocumentKeyDown)
    document.addEventListener( 'mousemove', onDocumentMouseMove )
    window.addEventListener( 'resize', onWindowResize)

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}

function onDocumentKeyDown(event){
    var keyCode = event.which
    if (keyCode == 32 && pause == false){
        pause = true
        console.log("pausa")
    }
    else if(keyCode == 32 && pause == true)
        pause = false
    if (keyCode == 87){
        fire(spaceship.position)
        console.log("Disparando :v")
    }
}

function onDocumentMouseMove( event ){
    event.preventDefault()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
	vector.unproject( camera )
	var dir = vector.sub( camera.position ).normalize()
	var distance = - camera.position.z / dir.z
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) )
    spaceship.position.copy(pos)
}

function lose(){
    reset.removeClass("hidden")
    console.log("lost")
    result.text("YOU DIED")
    pause = true
}

function detectCollision(){
    if(spaceshipCollider && buildingBox.length > 0){
        var index = 0
        for( let t of buildingBox){
            t = new THREE.Box3().setFromObject(buildings[index])
            if (spaceshipCollider.intersectsBox(t)){
                lose()
            }
            index = index + 1
        }
    }
    if(spaceshipCollider && robotBox.length > 0){
        var index = 0
        for( let t of robotBox){
            t = new THREE.Box3().setFromObject(robots[index])
            if (spaceshipCollider.intersectsBox(t)){
                updateStamina()
            }
            index = index + 1
        }
    }
    if(bulletCollider && robotBox.length > 0){
        var index = 0
        for( let t of robotBox){
            t = new THREE.Box3().setFromObject(robots[index])
            if (spaceshipCollider.intersectsBox(t)){
                updateScore(100)
                scene.remove(robots[index])
            }
            index = index + 1
        }
    }
}

function run() {
    requestAnimationFrame(function() { run() })
    renderer.render( scene, camera )
    if(!pause)
    KF.update()

    if(start){
        var now = Date.now()
        var deltat = now - currentTime
        currentTime = now
        if(!pause){
            if(orbitControls)
            orbitControls.update()

            if(spaceship)
            spaceshipCollider = new THREE.Box3().setFromObject(spaceship)
            
            if (score != 0 && score % 10 == 0)
                speed += 0.0001

            // Spawn building check
            var index = 0
            for(let t of buildingMap)
            {
                if(t == false && buildingSpawn[index] <= 0) //not in the map and time is 0
                {
                    posx = Math.floor(Math.random() * 16) + 0.5
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1
                    posz = Math.floor(Math.random() * 30) + msd
                    posz *= -1
                    buildings[index].position.z = posz
                    buildings[index].position.x = posx
                    buildingMap[index] = true
                }

                buildingSpawn[index] = buildingSpawn[index] - 0.01
                index = index + 1
            }

            // Buildings:
            index = 0
            for (let t of buildings){
                t.position.z += speed //movement
                if(t.position.z > 10){
                    if(buildingMap[index] == true){
                        updateScore()
                        buildingMap[index] = false //not in screen
                        buildingSpawn[index] = spawnTime() //new spawn time
                    }
                }
                index = index + 1
            }

            // Spawn robot check
            var indexR = 0
            for(let t of robotMap)
            {
                if(t == false && robotSpawn[indexR] <= 0) //not in the map and time is 0
                {
                    posx = Math.floor(Math.random() * 16) + 0.5
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1
                    posz = 30 + msd
                    posz *= -1
                    robots[indexR].position.z = posz
                    robots[indexR].position.x = posx
                    robotMap[indexR] = true
                }

                robotSpawn[indexR] = robotSpawn[indexR] - 0.01
                indexR = indexR + 1
            }

            // Robots:
            indexR = 0
            for (let t of robots){
                t.position.z += ufoSpeed //movement
                if(t.position.z > -10){
                    if(robotMap[indexR] == true){
                        robotMap[indexR] = false //not in screen
                        robotSpawn[indexR] = spawnTime() //new spawn time
                    }
                }
                indexR = indexR + 1
            }
            if (stamina < 0)
                lose()
            detectCollision()
        }
    }
}

function updateScore(s = 1){
    score += s
    document.getElementById("score").innerHTML = "Score: "+ score
}

function updateStamina(){
    stamina -= 5
    document.getElementById("stamina").innerHTML = "Stamina: " + stamina
}
