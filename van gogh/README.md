# Van Gogh — Site educativo

Este projeto é um site estático simples sobre a vida e obra de Vincent van Gogh. Foi criado para fins educativos e contém:

- `index.html` — página principal com seções: Biografia, Linha do tempo, Galeria, Citações, Contato.
- `style.css` — estilos responsivos e acessíveis com uma paleta inspirada em Van Gogh.
- `script.js` — lightbox e interações da galeria.

Como executar

1. Abra `index.html` no seu navegador (duplo-clique) ou
2. Sirva localmente com um servidor (recomendado para evitar restrições de CORS em alguns navegadores):

```powershell
# Em PowerShell, usando Python 3.x
python -m http.server 8000
# então abra http://localhost:8000
```

Melhor experiência e assets locais

- O site usa imagens do Wikimedia Commons por URL; para ter offline e reduzir latência, baixe as imagens desejadas para uma pasta `assets/` no mesmo diretório e atualize os caminhos em `index.html` (eu posso fazer isso para você se quiser).
- Servir via `http.server` melhora comportamento do navegador e permite testar o lightbox e fontes sem bloqueios.

Download automático das imagens

Há um script PowerShell `download-images.ps1` incluído que tenta baixar as imagens usadas pelo site para a pasta `assets/`.
Por padrão o site carrega as imagens diretamente das URLs originais (Wikimedia). Se preferir ter as imagens locais/offline, execute o script.

Para executar (PowerShell):

```powershell
# execute na pasta do projeto (onde está index.html)
.
\download-images.ps1
```

Se o download automático falhar (por bloqueios de rede ou mudanças nas URLs), você pode baixar manualmente os arquivos listados abaixo e colocá‑los em `assets/`:

- https://upload.wikimedia.org/wikipedia/commons/6/6d/Vincent_van_Gogh_1887.jpg  -> assets/van_gogh_portrait.jpg
- https://upload.wikimedia.org/wikipedia/commons/5/57/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg -> assets/starry_night.jpg
- https://upload.wikimedia.org/wikipedia/commons/4/45/Vincent_Willem_van_Gogh_-_Les_Tournesols_-_Google_Art_Project.jpg -> assets/sunflowers.jpg
- https://upload.wikimedia.org/wikipedia/commons/6/6b/Vincent_Willem_van_Gogh_-_The_Potato_Eaters_-_Google_Art_Project.jpg -> assets/potato_eaters.jpg
- https://upload.wikimedia.org/wikipedia/commons/0/05/Vincent_van_Gogh_-_Almond_Blossom.jpg -> assets/almond_blossom.jpg
- https://upload.wikimedia.org/wikipedia/commons/4/4b/Field_with_Cypresses_-_Van_Gogh.jpg -> assets/field_with_cypresses.jpg

Depois de colocar os arquivos em `assets/`, recarregue a página (ou abra `http://localhost:8000`) e o site usará os arquivos locais automaticamente quando disponíveis.

Fontes e créditos

- Imagens: Wikimedia Commons (domínio público) e acervos de museus.
- Informações: Van Gogh Museum, Rijksmuseum, Wikipedia (pt).

Licença

Conteúdo para uso educativo. Verifique licenças das imagens/museus antes de uso comercial.
