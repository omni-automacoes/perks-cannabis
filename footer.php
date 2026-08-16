<?php
/**
 * Footer — prints wp_footer() and closes the document.
 * Includes the fluid-scaling script that fits the 1920px design to any viewport.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<script>
(function () {
	var DESIGN_WIDTH = 1920, DESIGN_HEIGHT = 10480;
	var scaler = document.getElementById('perks-scaler');
	var stage  = document.getElementById('perks-stage');
	if (!scaler || !stage) return;
	function fit() {
		var w = document.documentElement.clientWidth;
		var scale = w / DESIGN_WIDTH;          // fit-to-width: preserves the exact layout
		if (scale > 1) scale = 1;              // never upscale beyond the 1920px design
		var offset = w > DESIGN_WIDTH ? (w - DESIGN_WIDTH) / 2 : 0; // center on wide screens
		stage.style.transform = 'translateX(' + offset + 'px) scale(' + scale + ')';
		scaler.style.height = (DESIGN_HEIGHT * scale) + 'px';
	}
	fit();
	window.addEventListener('resize', fit);
	window.addEventListener('orientationchange', fit);
})();
</script>
<?php wp_footer(); ?>
</body>
</html>
