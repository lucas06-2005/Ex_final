let vento = 0;
let temperatura = 0;
let codigoTempo = 0; // Código da meteorologia (chuva, nublado, etc)
let deDia = 1;       // 1 = Dia, 0 = Noite
let particulas = [];
let dadosCarregados = false; 

let nomeLocal = "Açores (Ilha Terceira)";
let aUsarLocalizacaoUtilizador = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  for (let i = 0; i < 150; i++) { 
    particulas.push(new Particula());
  }

  carregarMeteorologia(38.66, -27.22, "Açores (Ilha Terceira)");
}

function carregarMeteorologia(lat, lon, nome) {
  dadosCarregados = false; 
  nomeLocal = nome;
  
  // Adicionámos 'weather_code' e 'is_day' ao pedido
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code,is_day`;
  loadJSON(url, dadosRecebidos, erroDados);
}

function dadosRecebidos(dados) {
  vento = dados.current.wind_speed_10m;
  temperatura = dados.current.temperature_2m;
  codigoTempo = dados.current.weather_code;
  deDia = dados.current.is_day;
  dadosCarregados = true;
}

function erroDados() {
  alert("Erro ao carregar os dados. Verifica a internet.");
}

function draw() {
  if (dadosCarregados) {
    // 1. Mudar o fundo consoante a condição e hora do dia
    if (deDia === 0) {
      background(10, 15, 30, 50); // Noite
    } else if (codigoTempo >= 50) {
      background(100, 110, 120, 50); // Chuva (Dia escuro e cinzento)
    } else if (codigoTempo > 0) {
      background(150, 160, 175, 50); // Nublado
    } else {
      background(135, 206, 235, 50); // Sol / Céu limpo
    }

    // Traduzir o código em texto para o utilizador perceber
    let condicaoTexto = obterTextoCondicao(codigoTempo, deDia);

    fill(255);
    textAlign(CENTER);
    textSize(16);
    text(`${nomeLocal} | Vento: ${vento} km/h | Temp: ${temperatura}°C | ${condicaoTexto}`, width/2, 30);

    for (let p of particulas) {
      p.mover(vento, codigoTempo);
      p.desenhar(temperatura, deDia, codigoTempo);
    }
  } else {
    background(10, 20, 30, 50); 
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text("A contactar os satélites meteorológicos...", width/2, height/2);
  }

  desenharBotao();
}

// Função auxiliar para traduzir o código da API
function obterTextoCondicao(codigo, dia) {
  if (codigo >= 50) return "Chuva";
  if (codigo > 0) return "Nublado";
  return dia === 1 ? "Sol" : "Noite Limpa";
}

// EXPRESSÃO: Classe das partículas
class Particula {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.tamanhoBase = random(5, 30);
    this.opacidade = random(30, 100);
  }

  mover(velVento, codigo) {
    let velocidadeX = map(velVento, 0, 100, 1, 20);
    
    if (codigo >= 50) {
      // Se chove, cai na diagonal empurrado pelo vento
      this.x += velocidadeX;
      this.y += 10 + velocidadeX / 2; 
    } else {
      // Se não chove, move-se na horizontal (bruma/vento)
      this.x += velocidadeX;
      this.y += sin(frameCount * 0.05 + this.x) * 0.5; // Leve oscilação orgânica
    }

    // Quando sai do ecrã, volta a entrar
    if (this.x > width + this.tamanhoBase) this.x = -this.tamanhoBase;
    if (this.y > height + this.tamanhoBase) this.y = -this.tamanhoBase;
  }

  desenhar(temp, dia, codigo) {
    let corAzul = map(temp, 10, 30, 255, 150);
    let tamanho = this.tamanhoBase;

    if (codigo >= 50) {
      // Formato: Gota de chuva
      fill(150, 200, 255, this.opacidade);
      ellipse(this.x, this.y, tamanho / 4, tamanho); 
    } else if (codigo > 0) {
      // Formato: Nuvens redondas e densas
      fill(200, 200, 220, this.opacidade);
      ellipse(this.x, this.y, tamanho * 1.5); 
    } else {
      // Formato: Sol / Céu limpo
      if (dia === 1) {
         fill(255, 250, 200, this.opacidade); // Tons luminosos
      } else {
         fill(200, 220, corAzul, this.opacidade); // Tons azulados da noite
      }
      ellipse(this.x, this.y, tamanho);
    }
  }
}

// (As funções desenharBotao, mousePressed, pedirLocalizacao e windowResized continuam iguais, coloca-as aqui por baixo)

function desenharBotao() {
  let x = width / 2;
  let y = height - 50;
  let largura = 250;
  let altura = 40;

  if (mouseX > x - largura/2 && mouseX < x + largura/2 && mouseY > y - altura/2 && mouseY < y + altura/2) {
    fill(255, 255, 255, 80);
  } else {
    fill(255, 255, 255, 40);
  }
  
  rectMode(CENTER);
  rect(x, y, largura, altura, 10); 

  fill(255);
  textSize(14);
  let textoBotao = aUsarLocalizacaoUtilizador ? "Voltar à Ilha Terceira" : "Usar a Minha Localização";
  text(textoBotao, x, y + 5); 
}

function mousePressed() {
  let x = width / 2;
  let y = height - 50;
  let largura = 250;
  let altura = 40;

  if (mouseX > x - largura/2 && mouseX < x + largura/2 && mouseY > y - altura/2 && mouseY < y + altura/2) {
    if (aUsarLocalizacaoUtilizador) {
      aUsarLocalizacaoUtilizador = false;
      carregarMeteorologia(38.66, -27.22, "Açores (Ilha Terceira)");
    } else {
      pedirLocalizacao();
    }
  }
}

function pedirLocalizacao() {
  if (navigator.geolocation) {
    dadosCarregados = false; 
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        let lat = posicao.coords.latitude;
        let lon = posicao.coords.longitude;
        aUsarLocalizacaoUtilizador = true;
        carregarMeteorologia(lat, lon, "A Minha Localização Atual");
      },
      (erro) => {
        dadosCarregados = true; 
        alert("Não foi possível obter a tua localização.");
      }
    );
  } else {
    alert("O teu browser não suporta geolocalização.");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}