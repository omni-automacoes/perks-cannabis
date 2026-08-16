# Perks — Cannabis Medicinal (Tema WordPress)

Conversão **fiel** da landing page da Perks feita no Figma (versão final **PERKS LP_V9D**) para um tema WordPress custom, em HTML/CSS/PHP, **sem alterar o layout**.

## O que é

Um tema WordPress de página única (landing page). A página inteira é reproduzida pixel a pixel a partir da geometria exata do design do Figma (posições, tamanhos, cores, tipografia e imagens originais).

Seções (na ordem): Header · Hero + Marquee · Soluções Perks · "No que podemos ajudar você?" · Como funciona (4 etapas) · Frase · Sobre a Perks · Comparativo · Depoimentos · FAQ · CTA Final · Quem Somos · Footer.

## Instalação

1. Compacte a pasta `perks-theme` em um `.zip` (ou use o `perks-theme.zip` já gerado).
2. No painel do WordPress: **Aparência → Temas → Adicionar novo → Enviar tema** → selecione o `.zip` → **Instalar** → **Ativar**.
3. Em **Configurações → Leitura**, defina "Sua página inicial exibe" como **Uma página estática** e escolha qualquer página, ou deixe em "Últimos posts" — o tema usa `front-page.php`/`index.php` e renderiza a landing automaticamente.

## Responsividade

O design foi criado apenas em desktop (1920 px). O tema usa **escala fluida**: o layout de 1920 px é reduzido proporcionalmente para caber em qualquer largura de tela (tablet e mobile), **preservando 100% o layout** — nenhum elemento é reposicionado. Em telas maiores que 1920 px a página é centralizada.

> Observação: por ser escala proporcional, em telas muito pequenas (celular) o conteúdo fica reduzido. Um layout mobile *reflowado* (com seções empilhadas e texto em tamanho de leitura) pode ser feito como próxima etapa — isso envolve interpretação de design, já que o Figma não inclui uma versão mobile.

## Fontes

Carregadas via Google Fonts (enfileiradas em `functions.php`): **Space Grotesk** (títulos), **Montserrat** (corpo), **Space Mono** (rótulos). A fonte de destaque "Elite Math" do design usa fallback para Space Grotesk.

## Camada interativa (CTAs, WhatsApp e popup)

Inspirada no fluxo do site de referência (clickcannabis.com), adaptada à identidade da PERKS:

- **CTAs → WhatsApp**: os botões "Agendar consulta" e "Falar com a Perks" abrem o WhatsApp com mensagem pré-preenchida. "Como funciona" faz rolagem suave até a seção de etapas.
- **Seletor de condições** ("No que podemos ajudar você?"): multi-seleção real — clique nos chips para marcar/desmarcar (ficam em violeta). O botão **"Começe Agora"** abre um **popup PERKS** que resume as condições escolhidas e leva ao WhatsApp com elas já na mensagem.
- **Botão flutuante de WhatsApp**: fixo no canto inferior direito, em todas as telas.
- **Navegação**: itens do menu e do rodapé (Tratamentos, FAQ, Depoimentos, Sobre a Perks) rolam até a seção correspondente.

### Trocar o número de WhatsApp (um único lugar)

Abra `functions.php` e edite a constante:

```php
define( 'PERKS_WHATSAPP', '5599999999999' ); // 55 + DDD + número, só dígitos
```

As mensagens pré-preenchidas também ficam em `functions.php` (array `$perks_config['messages']`). Os arquivos da camada interativa são `assets/css/perks-interactions.css` e `assets/js/perks-interactions.js`.

## Estado atual

Reprodução **visual fiel** + camada interativa (CTAs, WhatsApp, popup, botão flutuante) ligada a um **número placeholder** — basta trocar pelo número real da PERKS no `functions.php`.

## Estrutura

```
perks-theme/
├─ style.css              # cabeçalho do tema + reset + escala responsiva
├─ functions.php          # enfileira Google Fonts + estilos
├─ header.php             # <head> + wp_head
├─ footer.php             # script de escala fluida + wp_footer
├─ front-page.php         # renderiza a landing (página inicial)
├─ index.php              # fallback (mesma landing)
├─ template-parts/
│  └─ stage.php           # markup da página (gerado a partir do Figma)
├─ assets/img/            # imagens originais do design
└─ screenshot.png         # miniatura do tema
```
