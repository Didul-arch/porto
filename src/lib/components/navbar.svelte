<script>
	const title = 'didul.porto';
	let menuOpen = $state(false);
</script>

<nav aria-label="Main navigation">
	<a class="logo" href="/">{title}<span class="version">[v1.0]</span></a>
	<button
		type="button"
		class="menu-toggle"
		aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
		aria-expanded={menuOpen}
		aria-controls="nav-links"
		onclick={() => menuOpen = !menuOpen}
	>=</button>
	<div id="nav-links" class="nav-items" class:open={menuOpen}>
    	<a href="/projects" onclick={() => menuOpen = false}>Projects</a>
    	<a href="/about" onclick={() => menuOpen = false}>About</a>
    	<a href="/blogs" onclick={() => menuOpen = false}>Blogs</a>
	</div>
</nav>

<style lang="scss">
  @use '../styles/variables';

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 1rem;
    padding: 1rem;
    border: 2px solid variables.$ink;
    width: calc(100% - 2rem);
    max-width: 1100px;
    margin: 1rem auto;
    box-sizing: border-box;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);

    .nav-items {
        display: none;
        flex-basis: 100%;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;

        &.open {
          display: flex;
        }
    }

    .menu-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .version {
        color: variables.$text-muted;
        font-weight: 100;
    }

    .logo {
        font-weight: bold;
        display: flex;
        gap: 6px;
    }

    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: inherit;
      text-decoration: none;
    }
  }

  @media (max-width: 767px) {
    nav {
      gap: 0 0.5rem;

      .logo {
        flex: 1;
        min-width: 0;
        flex-wrap: wrap;
        gap: 0 6px;
        overflow-wrap: anywhere;
      }

      .menu-toggle {
        flex: 0 0 44px;
      }

      .nav-items {
        min-width: 0;
        flex-direction: column;
        gap: 0.25rem;

        &.open {
          margin-top: 0.75rem;
        }

        a {
          box-sizing: border-box;
          padding: 0.5rem;
          font-family: variables.$font-mono;
          font-size: 1.0625rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
      }
    }
  }

  @media (min-width: 768px) {
    nav {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: calc(100% - 3rem);
      margin: 1.5rem auto;
      padding: 1rem 1.5rem;

      .menu-toggle {
        display: none;
      }

      .nav-items {
        display: flex;
        flex-basis: auto;
      }
    }
  }

  @media (min-width: 1024px) {
    nav {
      width: calc(100% - 4rem);
      margin: 2rem auto;
      padding: 1rem 2rem;
    }
  }
</style>
