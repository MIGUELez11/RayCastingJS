const TILE_SIZE = 64;
const MAP_NUM_ROWS = 10;
const MAP_NUM_COLS = 10;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map {
	constructor() {
		this.grid = [
			"1111111111",
			"1000000001",
			"1001111001",
			"1000001001",
			"1000001001",
			"1001111001",
			"1001000001",
			"1001000001",
			"1000000001",
			"1111111111"
		]
	}

	hasWallAt(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return 1;
		return this.grid[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] == '1';
	}

	render() {
		for (var i = 0; i < MAP_NUM_ROWS; i++)
			for (var j = 0; j < MAP_NUM_COLS; j++) {
				var tileX = j * TILE_SIZE;
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";;
				stroke("#222");
				fill(tileColor);
				rect(
					MINIMAP_SCALE_FACTOR * tileX,
					MINIMAP_SCALE_FACTOR * tileY,
					MINIMAP_SCALE_FACTOR * TILE_SIZE,
					MINIMAP_SCALE_FACTOR * TILE_SIZE);
			}
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 5;
		this.turnDirection = 0; //-1 if left. +1 if right;
		this.walkDirection = 0; //-1 if back. +1 if front
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 2.0;
		this.rotationSpeed = 2 * (Math.PI / 180);
	}

	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed;

		let moveStep = this.walkDirection * this.moveSpeed;
		let x = this.x + moveStep * Math.cos(this.rotationAngle);
		let y = this.y + moveStep * Math.sin(this.rotationAngle)
		if (!grid.hasWallAt(x, y)) {
			this.x = x;
			this.y = y;
		}
	}

	render() {
		noStroke();
		fill("red");
		circle(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			this.radius);
		// stroke("red");
		// let distance = 30;
		// line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * distance, this.y + Math.sin(this.rotationAngle) * distance);
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;

		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}

	cast() {
		let xIntercept, yIntercept;
		let xStep, yStep;
		/////////////////////////////////////////
		//Horizontal Ray-Grid intersection code//
		/////////////////////////////////////////
		let foundHorzWallhit = false;
		let horzWallHitX = 0;
		let horzWallHitY = 0;
		//Find the y-coordinate of the closes horizontal grid intersection
		yIntercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yIntercept += this.isRayFacingDown ? TILE_SIZE : 0;
		//Find the x-coordinate of the closes horizontal grid intersection
		xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);

		//Calculate the increment for xstep and yStep
		yStep = TILE_SIZE;
		yStep *= this.isRayFacingUp ? -1 : 1;
		xStep = TILE_SIZE / Math.tan(this.rayAngle);
		xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : 1;
		xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : 1;

		let nextHorzTouchX = xIntercept;
		let nextHorzTouchY = yIntercept;

		if (this.isRayFacingUp)
			nextHorzTouchY--;

		//Increment xStep and YStep ultil we find a wall

		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
				foundHorzWallhit = true;
				if (this.isRayFacingUp)
					nextHorzTouchY++
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;
				break;
			} else {
				nextHorzTouchX += xStep;
				nextHorzTouchY += yStep;
			}
		}

		/////////////////////////////////////////
		//Vertical Ray-Grid intersection code//
		/////////////////////////////////////////
		let foundVertWallHit = false;
		let vertWallHitX = 0;
		let vertWallHitY = 0;

		// Find the x-coordinate of the closest vertical grid intersenction
		xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;

		// Find the y-coordinate of the closest vertical grid intersection
		yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

		//Calculate the increment for xstep and yStep
		xStep = TILE_SIZE;
		xStep *= this.isRayFacingLeft ? -1 : 1;

		yStep = TILE_SIZE * Math.tan(this.rayAngle);
		yStep *= (this.isRayFacingUp && yStep > 0) ? -1 : 1;
		yStep *= (this.isRayFacingDown && yStep < 0) ? -1 : 1;

		let nextVertTouchX = xIntercept;
		let nextVertTouchY = yIntercept;

		if (this.isRayFacingLeft)
			nextVertTouchX--;

		//Increment xStep and YStep ultil we find a wall

		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextVertTouchX, nextVertTouchY)) {
				foundVertWallHit = true;
				if (this.isRayFacingLeft)
					nextVertTouchX++;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
				break;
			} else {
				nextVertTouchX += xStep;
				nextVertTouchY += yStep;
			}
		}

		//Calculate both distances and choose the smaller

		var horzHitDistance = foundHorzWallhit ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) : Number.MAX_VALUE;
		var vertHitDistance = foundVertWallHit ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;

		this.wallHitX = horzHitDistance < vertHitDistance ? horzWallHitX : vertWallHitX;
		this.wallHitY = horzHitDistance < vertHitDistance ? horzWallHitY : vertWallHitY;
		this.distance = horzHitDistance < vertHitDistance ? horzHitDistance : vertHitDistance;
		this.wasHitVertical = vertHitDistance < horzHitDistance;
	}

	render() {
		stroke("rgba(0, 255, 0, 1)");
		line(
			MINIMAP_SCALE_FACTOR * player.x,
			MINIMAP_SCALE_FACTOR * player.y,
			MINIMAP_SCALE_FACTOR * this.wallHitX,
			MINIMAP_SCALE_FACTOR * this.wallHitY);
	}

}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function render3DProjectedWalls() {
	for (let i = 0; i < NUM_RAYS; i++) {
		let ray = rays[i]
		let correctDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
		let distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);
		//Projected wall height
		let wallStripHeight = (TILE_SIZE / correctDistance) * distanceProjectionPlane;
		if (ray.wasHitVertical) {
			if (ray.wallHitX < player.x)
				fill(`rgba(0, 255,255, ${250 / correctDistance})`);
			else
				fill(`rgba(0, 255, 0, ${250 / correctDistance})`);
		}
		else {
			if (ray.wallHitY < player.y)
				fill(`rgba(255, 0,255, ${250 / correctDistance})`);
			else
				fill(`rgba(255, 255, 0, ${250 / correctDistance})`);

		}
		noStroke();
		rect(
			i * WALL_STRIP_WIDTH,
			(WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function normalizeAngle(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0)
		return angle + (2 * Math.PI);
	return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT)
}

function castAllRays() {
	let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

	rays = [];

	for (let i = 0; i < NUM_RAYS; i++) {
		let ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_RAYS;
	}
}

function update() {
	player.update();
	castAllRays();
	//Update game objects
}

function draw() {
	clear("#212121");
	update();

	render3DProjectedWalls();
	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}

