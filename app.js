const PILLAR_WIDTH = 100;
const PILLAR_SPACING = 400;
const GAME_SPEED = .1;
const BIRD_HEIGHT = 30;
const BIRD_WIDTH = 30;
const BIRD_OFFSET = 100;

const draw = world => {
    const { canvas, ctx } = world;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // draw the pillars
    ctx.fillStyle = '#774411';
    world.pillars.map(
        ({ offset, opening, position }) => {
            ctx.fillRect(position, 0, PILLAR_WIDTH, offset);
            const lowerPartY = offset + opening;
            ctx.fillRect(
                position, lowerPartY, PILLAR_WIDTH, canvas.height - lowerPartY
            );
        }
    );

    // draw the bird
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(BIRD_OFFSET, world.birdPosition, BIRD_WIDTH, BIRD_HEIGHT);

    ctx.fillText(
        'Anna, das flatternde Vögelchen',
        BIRD_OFFSET + 35,
        world.birdPosition + 20
    );

    world.scoreElement.textContent = `Score: ${world.score}`;

    if (!world.gameRunning) {
        ctx.fillStyle = '#000000';
        ctx.fillText('Press Enter to start the game.', 10, 10);
    }
};

const update = world => {
    const { canvas: { height, width } } = world;

    const now = Date.now();
    const diff = now - world.time;
    world.time = now;
    world.age += diff;

    world.birdPosition = Math.min(
        height - BIRD_HEIGHT, Math.max(0, world.birdPosition + world.birdVelocity * diff)
    );

    if (world.birdPosition === 0) {
        world.birdVelocity = 0;
    }

    world.birdVelocity += .01;

    const p = world.pillars = world.pillars.filter(pillar => {
        pillar.position -= GAME_SPEED * diff + world.age * 0.0001;
        const toRemove = pillar.position < -PILLAR_WIDTH;
        if (toRemove) {
            world.score += 1;
        }
        return !toRemove;
    });

    if (
       p.length === 0
       || p[p.length - 1].position + PILLAR_WIDTH < width - PILLAR_SPACING
    ) {
        p.push({
            position: width,
            offset: Math.round(Math.random() * height / 2),
            opening: Math.round(Math.random() * (height - 300) / 2 + 150)
        });
    }

    // check for collision
    if (
        BIRD_OFFSET + BIRD_WIDTH > p[0].position
        && BIRD_OFFSET < p[0].position + PILLAR_WIDTH
        && (
            world.birdPosition < p[0].offset
            || world.birdPosition + BIRD_HEIGHT > p[0].offset + p[0].opening
        )
    ) {
        world.gameRunning = false;
        showGameOver(world);
    }
};

const startGame = world => {
    world.message.style.display = 'none';
    let i = 0;

    const tick = () => {
        i++;
        update(world);
        if (i % 2 === 0) {
            draw(world);
        }

        if (!world.gameRunning) {
            reset(world);
            return;
        }

        window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
};

const onKeyPress = world => e => {
    if (world.gameRunning) {
        if (e.key === ' ') {
            world.birdVelocity = -.3;
        }
    } else {
        if (e.key === 'Enter') {
            world.gameRunning = true;
            world.time = Date.now();
            world.birdVelocity = -.1;
            world.age = 0;
            startGame(world);
        }
    }
};

const reset = world => {
    Object.assign(world, {
        gameRunning: false,
        birdPosition: 100,
        birdVelocity: 1,
        pillars: [],
        time: Date.now(),
        age: 0,
        score: 0
    });
};

const showGameOver = world => {
    const { message } = world;
    message.textContent = 'Uups!';
    message.style.fontSize = '800%';
    message.style.display = 'block';
    setTimeout(() => showTitle(world), 500);
};

const showTitle = world => {
    const { message } = world;
    message.textContent = 'Annas persönlicher Flappy-Bird-Klon';
    message.style.fontSize = '200%';
    message.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const message = document.getElementById('display-message');
    const scoreElement = document.getElementById('score');

    const { innerWidth: width, innerHeight: height } = window;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const world = { canvas, ctx, message, scoreElement };
    reset(world);

    document.addEventListener('keypress', onKeyPress(world));

    startGame(world);
    showTitle(world);
});
