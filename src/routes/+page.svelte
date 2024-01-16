<section class="hero">
	<div class="hero-container">
		<h1>shelf-control</h1>

		<p>shelf-control is a web app for managing your book library</p>
        <div class="hero-links">
            <a href="/login" class="button-link button-primary">Login</a>
            <a href="/signup" class="button-link button-primary">Sign up</a>
        </div>
	</div>
</section>

<style>
	section {
		align-items: end;
		justify-content: end;
		height: calc(100vh - 5rem);
		background-color: var(--primary-color);
		max-width: none;
	}

	h1 {
		font-size: 3rem;
		font-family: var(--header-font);
		font-weight: 600;
		letter-spacing: 0.05rem;
		margin-bottom: 0.75rem;
		color: var(--primary-white);
		color: var(--primary-grey);
		padding: 0 1rem 0 1.25rem;
		position: relative;
		border-right: 0.25rem solid var(--primary-grey);
		border-bottom: 0.25rem solid var(--primary-grey);
	}

	p {
		font-size: 1.25rem;
		font-family: var(--header-font);
		letter-spacing: 0.05rem;
		line-height: 1.75rem;
		margin-bottom: 1rem;
		color: var(--primary-grey);
		padding: 0 0.75rem 0 0.5rem;
		position: relative;
		width: 100%;
	}

    .button-link {
        background-color: var(--accent-purple);
        background-color: var(--secondary-color);
        color: var(--primary-color);
        border: 2px solid var(--secondary-color);
    }

    .button-link:hover {
        background-color: var(--accent-purple);
        /* color: var(--primary-grey); */
        border: 2px solid var(--accent-purple);
    }

	/* h1::after {
        content: '';
        display: block;
        width: 120%;
        height: 0.25rem;
        background-color: var(--primary-grey);
        position: absolute;
        bottom: 0;
        left: -18%;
    } */

	.hero-container {
		display: flex;
		flex-direction: column;
		align-items: end;
		justify-content: end;
		height: 100%;
		margin: 0 2rem 16rem;
		text-align: right;
	}

    .hero-links {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
    }

	@media (min-width: 768px) {
		h1 {
			font-size: 5rem;
			border-right: 0.5rem solid var(--primary-grey);
			border-bottom: 0.5rem solid var(--primary-grey);
            border-right: 0.5rem solid var(--accent-purple);
			border-bottom: 0.5rem solid var(--accent-purple);
		}

		p {
			font-size: 1.5rem;
			margin-bottom: 0.75rem;
			padding: 0 0.75rem 0 1.25rem;
			/* border-right: 0.5rem solid var(--accent-purple);
			border-bottom: 0.2rem solid var(--accent-purple); */
			line-height: 2.5rem;
            margin-bottom: 2rem;
		}
		.hero-container {
			margin: 0 10rem 16rem;
		}
	}
</style>
