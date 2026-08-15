# Sistema de Design - Gestor de Revisão Automotiva

Documento de especificação visual do sistema de design extraído do projeto Stitch **Gestor de Revisão Automotiva** (ID: `projects/4778585757779429356`).

---

## 🎨 1. Visão Geral e Identidade da Marca (Brand & Style)

- **Conceito Visual**: Corporativo Moderno (*Corporate / Modern*), focado em confiabilidade, transparência e precisão mecânica.
- **Filosofia de UI**: Interface limpa e silenciosa para priorizar alertas de serviço, manutenção e status do veículo ("paz de espírito").
- **Tipografia Principal**: `Inter` (para todos os papéis: títulos, corpo e rótulos).
- **Arredondamento Padrão**: `8px` (`0.5rem`).

---

## 🎨 2. Paleta de Cores (Color Palette)

### Cores Principais & Funcionais
- **Primary (Trust Blue)**: `#003d9b` (Cor principal de ação, botões primários e indicadores de progresso)
- **Primary Container**: `#0052cc` / `#dae2ff`
- **Secondary (Safe Green)**: `#006e2f` (Status concluídos, inspeções aprovadas e indicadores positivos)
- **Secondary Container**: `#6bff8f` (Fundo claro para tags/badges de sucesso)
- **Tertiary (Warning / Orange-Brown)**: `#7b2600` / `#a33500` (Alertas secundários)
- **Error (Danger Red)**: `#ba1a1a` / Container: `#ffdad6` (Erros críticos, falhas de segurança e revisões severamente atrasadas)

### Neutros & Superfícies
- **Background**: `#f8f9ff` (Off-white levemente azulado)
- **Surface**: `#f8f9ff`
- **Surface Container Lowest**: `#ffffff` (Cards e superfícies elevaras)
- **Surface Container Low**: `#eff4ff`
- **Surface Container**: `#e6eeff`
- **Surface Container High**: `#dee9fc`
- **Surface Container Highest**: `#d9e3f6`
- **On-Surface (Texto Principal)**: `#121c2a` (Charcoal escuro de alto contraste)
- **On-Surface Variant (Texto Secundário)**: `#434654`
- **Outline**: `#737685` (Bordas de elementos neutros)
- **Outline Variant**: `#c3c6d6` (Linhas divisórias suaves)

---

## 🔤 3. Tipografia (Typography & Hierarchy)

Toda a tipografia utiliza a fonte **Inter** mapeada em uma grade de linha de base de 4px:

| Nível / Papel | Tamanho (`fontSize`) | Peso (`fontWeight`) | Altura de Linha (`lineHeight`) | Espaçamento de Letra (`letterSpacing`) |
| :--- | :--- | :--- | :--- | :--- |
| **Headline Large** | `32px` | 700 (Bold) | `40px` | `-0.02em` |
| **Headline Large (Mobile)** | `24px` | 700 (Bold) | `32px` | `-0.01em` |
| **Headline Medium** | `20px` | 600 (SemiBold) | `28px` | `0` |
| **Body Large** | `16px` | 400 (Regular) | `24px` | `0` |
| **Body Small** | `14px` | 400 (Regular) | `20px` | `0` |
| **Label Caps** | `12px` | 600 (SemiBold) | `16px` | `0.05em` (Caixa alta) |
| **Status Badge** | `12px` | 500 (Medium) | `12px` | `0` |

---

## 📐 4. Regras de Espaçamento e Margens (Spacing & Layout Rules)

Escola de espaçamento baseada em incrementos lineares de **4px**:

- `xs`: `4px`
- `sm`: `8px`
- `md`: `16px` (Preenchimento interno padrão de cards e componentes)
- `lg`: `24px` (Espaçamento vertical entre seções lógicas)
- `xl`: `40px`
- **Gutter (Calha)**: `16px`
- **Margem Mobile**: `16px`
- **Margem Desktop**: `32px`
- **Largura Máxima de Conteúdo (Desktop)**: `1200px`

### Estrutura de Grid Responsivo
- **Mobile**: Grid de 4 colunas com margem de 16px e calha de 16px.
- **Tablet**: Grid de 8 colunas com margem de 24px e calha de 16px.
- **Desktop**: Grid de 12 colunas com margem de 32px e calha de 24px.

---

## 🔳 5. Formas & Border Radius (Shapes)

- `sm`: `4px` (`0.25rem`)
- **DEFAULT (Padrão para Cards e Inputs)**: `8px` (`0.5rem`)
- `md`: `12px` (`0.75rem`)
- `lg`: `16px` (`1rem`)
- `xl`: `24px` (`1.5rem`) - Usado para chips interativos e badges
- `full`: `9999px` (Formato Pílula)

---

## 🔘 6. Componentes e Elementos Interativos

### Botões (`Buttons`)
- **Primário**: Fundo azul sólido (`#003d9b` / `#0052cc`), texto branco, raio de borda de 8px.
- **Secundário**: Fundo branco (`#ffffff`), texto cinza/escuro, borda de 1px cinza (`#e5e7eb`).
- **Crítico / Ação Positiva**: Fundo verde seguro (`#006e2f`), usado para acionar registro ou concluir serviço.

### Cards (`Cards`)
- Container primário para histórico de serviços.
- Fundo branco puro (`#ffffff`), borda sutil de 1px (`#e5e7eb`), padding interno de `16px` (`md`).
- Alojamento de ícones em círculo cinza claro de `40x40px` à esquerda do card.

### Campos de Entrada (`Input Fields`)
- Borda cinza clara (`#d1d5db`), mudando para azul primário no estado de foco (`focus`).
- Rótulos (*Labels*) sempre visíveis acima do campo no estilo `Label Caps` (`12px`, bold).

### Badges de Status (`Status Badges`)
- Usados para status: "Próxima", "Pendente", "Vencida", "Concluída".
- Formato pílula (`rounded-xl`), fundo em tom pastel de baixa opacidade combinando com a cor do status (ex: fundo verde claro com texto verde escuro para concluído).

### Linha do Tempo (`Timeline`)
- Componente de linha vertical conectando cards na visualização de histórico, criando um fluxo cronológico.

---

## ☀️ 7. Sombras & Profundidade (Elevation & Depth)

- **Nível 0 (Background)**: `#f8f9ff` (Off-white).
- **Nível 1 (Cards / Containers)**: Branco `#ffffff` com borda de 1px `#e5e7eb`.
- **Nível 2 (Hover / Ativo)**: Sombra suave e difundida: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
- **Modais**: Overlays semitransparentes com desfoque de fundo (*backdrop blur*).
