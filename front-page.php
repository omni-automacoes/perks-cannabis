<?php
/**
 * Front page — renders the Perks landing page (faithful Figma V9D reproduction).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

// Base URL for the design's image assets.
$img = trailingslashit( get_template_directory_uri() ) . 'assets/img/';
?>
<main id="perks-scaler">
	<?php include locate_template( 'template-parts/stage.php' ); ?>
</main>
<?php
get_footer();
