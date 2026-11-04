<script>
    const nama = `Syafiq Syadidul`

    import RotatingCat from "#lib/components/RotatingCat.svelte";
</script>

<style lang="scss">
    main {
        width: calc(100% - 2rem);
        max-width: 1100px;
        margin: 0 auto 2rem;
        box-sizing: border-box;
    }

    .hero-section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: center;
      gap: clamp(1.5rem, 4vw, 3rem);
      font-size: clamp(1rem, 2.2vw, 1.5rem);

      > div {
          min-width: 0;
      }

      .hero-cat {
          display: flex;
          flex-direction: column;
          width: min(100%, 300px);
          justify-self: center;

          span {
              font-size: 1rem;
              text-align: center;
              color: darkgrey;
          }
      }
    }

    p {
      color: inherit;
      text-decoration: none;
      margin: 0;
      line-height: 1.7;
    }

    @media (min-width: 768px) {
      main {
        width: calc(100% - 3rem);
      }

      .hero-section {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      }
    }

    @media (min-width: 1024px) {
      main {
        width: calc(100% - 4rem);
      }

      .hero-section {
        .hero-cat {
          width: min(100%, 360px);
        }
      }
    }
</style>

<main>
    <div class="hero-section">
        <div style="text-align: justify;">
            <p>Hi, I’m {nama}, a <span style="font-weight: 600;">Software Engineer</span> from Indonesia. I focus on backend development, turning complex business logic into clean, dependable systems. I also explore machine learning and distributed systems on the side.</p>
        </div>
        <div class="hero-cat">
            <RotatingCat speed={0.55} fps={30} color="#00008B"/>
            <span>Say hi to the cat!</span>
        </div>
    </div>
</main>
