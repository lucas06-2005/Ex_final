let vento = 0;
let temperatura = 0;
let particulas = [];
let dadosCarregados = false; // Controla se os dados já chegaram

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Cria as partículas logo de início
  for (let i = 0; i < 100; i++) {
    particulas.push(new Particula());
  }

  // URL da API para a Ilha Terceira (Angra do Heroísmo)
  let url = 'https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-27.22&current=temperature_2m,wind_speed_10m';
  
  // Pede os dados, mas NÃO bloqueia o ecrã. 
  // Quando chegarem, executa a função 'dadosRecebidos'
  loadJSON(url, dadosRecebidos, erroDados);
}

// Função que corre automaticamente quando a API responde com sucesso
function dadosRecebidos(dados) {
  vento = dados.current.wind_speed_10m;
  temperatura = dados.current.temperature_2m;
  dadosCarregados = true;
}

// Função de segurança caso a internet falhe
function erroDados() {
  alert("Não foi possível carregar os dados da meteorologia. Verifica a ligação à internet.");
}

function draw() {
  background(10, 20, 30, 50); 
  
  fill(255);
  textAlign(CENTER);
  textSize(16);

  // Só desenha a bruma se os dados já tiverem chegado
  if (dadosCarregados) {
    text(`Açores (Ilha Terceira) | Vento: ${vento} km/h | Temp: ${temperatura}°C`, width/2, 30);

    for (let p of particulas) {
      p.mover(vento);
      p.desenhar(temperatura);
    }
  } else {
    // Feedback visual enquanto espera pela API
    text("A contactar os satélites meteorológicos dos Açores...", width/2, height/2);
  }
}

// EXPRESSÃO: Classe que define as partículas de bruma
class Particula {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.tamanho = random(10, 40);
    this.opacidade = random(30, 100);
  }

  mover(velVento) {
    let velocidadeX = map(velVento, 0, 100, 1, 20);
    this.x += velocidadeX;

    if (this.x > width + this.tamanho) {
      this.x = -this.tamanho;
      this.y = random(height);
    }
  }

  desenhar(temp) {
    let corAzul = map(temp, 10, 30, 255, 150);
    fill(200, 220, corAzul, this.opacidade);
    ellipse(this.x, this.y, this.tamanho);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}