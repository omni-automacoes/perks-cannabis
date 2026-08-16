<?php
/**
 * Fallback template — renders the same Perks landing page as the front page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$img = trailingslashit( get_template_directory_uri() ) . 'assets/img/';
?>
<main id="perks-scaler">
	<?php include locate_template( 'template-parts/stage.php' ); ?>
</main>
<?php
get_footer();
