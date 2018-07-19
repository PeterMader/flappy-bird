const PILLAR_WIDTH = 100;
const PILLAR_SPACING = 200;
const GAME_SPEED = .08;
const BIRD_HEIGHT = 30;
const BIRD_WIDTH = 30;
const BIRD_OFFSET = 100;

const draw = world => {
    const { canvas, ctx } = world;

    ctx.fillStyle = '#5588FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height * .3);
    ctx.fillStyle = '#55FF66';
    ctx.fillRect(0, canvas.height * .3, canvas.width, canvas.height * .7);
    
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

    ctx.fillStyle = '#000000';
    ctx.fillText(`Score: ${world.score}`, 10, canvas.height - 20);

    if (!world.gameRunning) {
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
            opening: Math.round(Math.random() * (height - 200) / 2 + 100)
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

    const tick = () => {
        update(world);
        draw(world);

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
    message.style.display = 'block';
    setTimeout(() => showTitle(world), 1000);
};

const showTitle = world => {
    const { message } = world;
    message.textContent = 'Annas persönlicher Flappy-Bird-Klon';
    message.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const message = document.getElementById('display-message');

    const { innerWidth: width, innerHeight: height } = window;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const world = { canvas, ctx, message };
    reset(world);

    document.addEventListener('keypress', onKeyPress(world));

    startGame(world);
    showTitle(world);
});
