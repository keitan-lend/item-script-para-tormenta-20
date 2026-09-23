# Item Script para Tormenta 20

Permite executar um script personalizado automaticamente ao usar qualquer item no Foundry VTT, com foco no sistema Tormenta 20.

## Créditos e Base Original

Este módulo é um **fork** e uma adaptação do trabalho original de **[Haydgi](https://github.com/Haydgi)**. Sem o esforço e a base sólida do projeto [Item Script para Tormenta 20](https://github.com/Haydgi/item-script-para-tormenta-20), esta versão não existiria. Todos os créditos pela ideia original e implementação base são devidos a ele.

As modificações nesta versão incluem a adaptação para o Foundry VTT v14 e o sistema Tormenta 20 1.6.2, garantindo a continuidade do uso do módulo em versões mais recentes.

## Funcionalidades

- Adiciona um botão "Script" no topo da janela de interface dos itens.
- Executa o script definido sempre que o item for usado.
- Permite interagir com propriedades do item, como nome e círculo da magia.
- Ideal para integrar o sistema a outros módulos, controlar CDs de habilidades (como Engenhocas) e gerenciar recursos baseados em número de usos.

## Como Usar

1.  Edite um item qualquer no seu mundo.
2.  Clique no botão `Script` no topo da ficha do item.
3.  Digite o script que deseja executar no campo de texto.
4.  Salve e use o item normalmente!

### Exemplo de Uso: Controle de CD para Engenhocas

Este script foi feito para controlar a CD de ativação de uma Engenhoca, tornando-a mais poderosa a cada uso.

```js
const ENGENHOCA = item.name;
const CIRCULO = Number(item.system?.circulo) || 1;
const CIRCULO_BONUS = [0, 1, 3, 6, 10, 15][CIRCULO] || 1;

let valor = await item.getFlag("item-script-t20", "cd");

if (typeof valor !== "number") {
  valor = 15 + CIRCULO_BONUS;
}

valor += 5;

await item.setFlag("item-script-t20", "cd", valor);

ChatMessage.create({
  content: `<b>CD atual de ${ENGENHOCA}:</b> ${valor - 5} (Círculo: ${CIRCULO})`,
  speaker: ChatMessage.getSpeaker()
});
```

**Como funciona:** A cada uso, o script lê a flag `cd` do item. Se não existir, define uma CD base. Em seguida, soma 5 a essa CD e salva o novo valor de volta na flag. Por fim, envia uma mensagem no chat mostrando a CD atual. Basta somar os PMs extras de aprimoramentos.

## Instalação

1.  No Foundry VTT, vá para a aba **"Add-on Modules"** (Módulos Adicionais).
2.  Clique em **"Install Module"** (Instalar Módulo).
3.  No campo **"Manifest URL"** (URL do Manifesto), cole o link do seu `module.json`:
    `https://raw.githubusercontent.com/SEU-USUARIO/item-script-para-tormenta-20/main/module.json`
4.  Clique em **"Install"**.

## Informações

- **Desenvolvedor (Fork):** [keitan-lend](https://github.com/keitan-lend)
- **Discord do Autor (Fork):** lucashmuniz
- **Desenvolvedor Original:** [Haydgi](https://github.com/Haydgi)
- **Discord do Autor Original:** xdhayd