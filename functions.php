<?php
/**
 * Perks Cannabis Medicinal — theme functions
 * Faithful conversion of the Figma landing page (V9D).
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! function_exists( 'perks_setup' ) ) {
	function perks_setup() {
		add_theme_support( 'title-tag' );
		add_theme_support( 'html5', array( 'style', 'script' ) );
		add_theme_support( 'post-thumbnails' );
	}
}
add_action( 'after_setup_theme', 'perks_setup' );

/**
 * Enqueue Google Fonts (Space Grotesk, Montserrat, Space Mono) and the theme stylesheet.
 */
function perks_enqueue_assets() {
	// Google Fonts used by the design.
	wp_enqueue_style(
		'perks-google-fonts',
		'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
		array(),
		null
	);

	wp_enqueue_style(
		'perks-style',
		get_stylesheet_uri(),
		array( 'perks-google-fonts' ),
		wp_get_theme()->get( 'Version' )
	);

	$ver = wp_get_theme()->get( 'Version' );

	// Interactive layer (CTAs, condition selector popup, WhatsApp, floating button).
	wp_enqueue_style(
		'perks-interactions',
		get_template_directory_uri() . '/assets/css/perks-interactions.css',
		array( 'perks-style' ),
		$ver
	);
	wp_enqueue_script(
		'perks-interactions',
		get_template_directory_uri() . '/assets/js/perks-interactions.js',
		array(),
		$ver,
		true
	);

	// ---- Single source of truth for the WhatsApp number + messages ----
	// Para trocar o número, edite a constante PERKS_WHATSAPP no fim deste arquivo.
	$perks_config = array(
		'wa' => defined( 'PERKS_WHATSAPP' ) ? PERKS_WHATSAPP : '5511994300213',
		// Mensagem enviada ao WhatsApp. {nome} e {sintoma} são preenchidos com os dados do paciente.
		'template'     => 'Olá! Meu nome é {nome}. Estou buscando ajuda para {sintoma} e gostaria de entender como funciona a avaliação da PERKS CANNABIS.',
		// Usada quando o paciente não seleciona uma condição.
		'template_sem' => 'Olá! Meu nome é {nome}. Gostaria de entender como funciona a avaliação da PERKS CANNABIS.',
	);
	wp_add_inline_script(
		'perks-interactions',
		'window.PERKS_CONFIG = ' . wp_json_encode( $perks_config ) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'perks_enqueue_assets' );

/**
 * WhatsApp number for the interactive CTAs.
 * Troque o valor abaixo pelo número real da Perks (55 + DDD + número, só dígitos).
 */
if ( ! defined( 'PERKS_WHATSAPP' ) ) {
	define( 'PERKS_WHATSAPP', '5511994300213' ); // PERKS: +55 (11) 99430-0213
}

/**
 * Preconnect to Google Fonts for faster loading.
 */
function perks_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'perks_resource_hints', 10, 2 );
