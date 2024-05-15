        const pupils = document.querySelectorAll('.pupil');
        const eyeBalls = document.querySelectorAll('.eyeBall');

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX * 100 / window.innerWidth + '%';
            const y = e.clientY * 100 / window.innerHeight + '%';
            pupils.forEach(pupil => {
                pupil.style.left = x;
                pupil.style.top = y;
                pupil.style.transform = `translate(-${x}, -${y})`;
            });
        });