const CATEGORIAS_PRINCIPAIS = ["CALÇADOS","ROUPAS","ACESSÓRIOS","OUTROS"];

const SUBCATEGORIAS_POR_PRINCIPAL = {
  "CALÇADOS": ["Tênis masculino","Tênis feminino","Tênis infantil","Chinelos","Chinelo infantil","Sandálias","Sandália infantil","Botas","Sapatos","Sapatilhas","Calçados"],
  "ROUPAS": ["Blusa masculina","Blusa feminina","Camisa masculina","Camiseta masculina","Camiseta feminina","Polo masculina","Vestido","Saia","Calça masculina","Calça feminina","Calça jeans masculina","Calça jeans feminina","Jeans masculino","Jeans feminino","Bermuda masculina","Short feminino","Jaqueta","Jaqueta masculina","Jaqueta feminina","Conjunto feminino","Conjunto masculino","Conjunto infantil","Calça moletom","Blusa moletom","Conjunto moletom masculino","Conjunto moletom feminino","Conjunto moletom infantil","Cueca","Calcinha","Sutiã/Top","Meias","Pijama"],
  "ACESSÓRIOS": ["Bolsas","Mochilas","Cintos","Carteiras","Bonés","Acessórios"],
  "OUTROS": ["Outros"]
};

const CATEGORIAS_FISCAIS = CATEGORIAS_PRINCIPAIS.flatMap(function(grupo){
  return SUBCATEGORIAS_POR_PRINCIPAL[grupo] || [];
});

const NCM_POR_CATEGORIA = {
  "Tênis masculino": "64041100",
  "Tênis feminino": "64041100",
  "Tênis infantil": "64041100",
  "Chinelos": "64022000",
  "Chinelo infantil": "64022000",
  "Sandálias": "64022000",
  "Sandália infantil": "64022000",
  "Botas": "64039990",
  "Sapatos": "64039990",
  "Sapatilhas": "64029990",
  "Calçados": "64029990",
  "Blusa masculina": "61091000",
  "Blusa feminina": "61091000",
  "Camisa masculina": "61091000",
  "Camiseta masculina": "61091000",
  "Camiseta feminina": "61091000",
  "Polo masculina": "61051000",
  "Vestido": "62044300",
  "Saia": "62045300",
  "Calça masculina": "62034200",
  "Calça feminina": "62046200",
  "Calça jeans masculina": "62034200",
  "Calça jeans feminina": "62046200",
  "Jeans masculino": "62034200",
  "Jeans feminino": "62046200",
  "Bermuda masculina": "62034200",
  "Short feminino": "62046200",
  "Jaqueta": "62029300",
  "Jaqueta masculina": "62019300",
  "Jaqueta feminina": "62029300",
  "Conjunto feminino": "61042300",
  "Conjunto masculino": "61032300",
  "Conjunto infantil": "61042300",
  "Calça moletom": "61046200",
  "Blusa moletom": "61102000",
  "Conjunto moletom masculino": "61102000",
  "Conjunto moletom feminino": "61102000",
  "Conjunto moletom infantil": "61102000",
  "Cueca": "61071100",
  "Calcinha": "61082200",
  "Sutiã/Top": "62121000",
  "Meias": "61159600",
  "Pijama": "61083100",
  "Bolsas": "42029200",
  "Mochilas": "42029200",
  "Cintos": "42033000",
  "Carteiras": "42023200",
  "Bonés": "65050090",
  "Acessórios": "",
  "Outros": ""
};

const REF_POR_CATEGORIA = {
  "Tênis masculino": "TENM",
  "Tênis feminino": "TENF",
  "Tênis infantil": "TENI",
  "Chinelos": "CHI",
  "Chinelo infantil": "CHII",
  "Sandálias": "SAN",
  "Sandália infantil": "SANI",
  "Botas": "BOT",
  "Sapatos": "SAP",
  "Sapatilhas": "SAT",
  "Calçados": "CALC",
  "Blusa masculina": "BLM",
  "Blusa feminina": "BLU",
  "Camisa masculina": "CAM",
  "Camiseta masculina": "CMM",
  "Camiseta feminina": "CMF",
  "Polo masculina": "POL",
  "Vestido": "VES",
  "Saia": "SAI",
  "Calça masculina": "CALM",
  "Calça feminina": "CALF",
  "Calça jeans masculina": "JEM",
  "Calça jeans feminina": "JEF",
  "Jeans masculino": "JEM",
  "Jeans feminino": "JEF",
  "Bermuda masculina": "BERM",
  "Short feminino": "SHO",
  "Jaqueta": "JAQ",
  "Jaqueta masculina": "JAM",
  "Jaqueta feminina": "JAF",
  "Conjunto feminino": "CON",
  "Conjunto masculino": "CONM",
  "Conjunto infantil": "CONI",
  "Calça moletom": "MOLC",
  "Blusa moletom": "MOLB",
  "Conjunto moletom masculino": "MOLM",
  "Conjunto moletom feminino": "MOLF",
  "Conjunto moletom infantil": "MOLI",
  "Cueca": "CUE",
  "Calcinha": "CALCIN",
  "Sutiã/Top": "SUT",
  "Meias": "MEI",
  "Pijama": "PIJ",
  "Bolsas": "BOL",
  "Mochilas": "MOC",
  "Cintos": "CIN",
  "Carteiras": "CAR",
  "Bonés": "BON",
  "Acessórios": "ACE",
  "Outros": "PRO"
};

const SUBCATEGORIA_TO_PRINCIPAL = Object.fromEntries(
  Object.entries(SUBCATEGORIAS_POR_PRINCIPAL).flatMap(function(entry){
    var grupo = entry[0], lista = entry[1];
    return lista.map(function(sub){ return [sub, grupo]; });
  })
);

function categoriaPrincipalPorSubcategoria(subcat){
  return SUBCATEGORIA_TO_PRINCIPAL[subcat] || 'OUTROS';
}

function inferCategoriaPorTexto(txt){
  var s=String(txt||'').toLowerCase();
  if(!s) return 'OUTROS';
  var regras=[
    ['CALÇADOS',['sandália','sandalia','chinelo','tênis','tenis','sapato','bota','sapatilha','papete','tamanco','rasteira']],
    ['ROUPAS',['camiseta','camisa','blusa','calça','calca','jeans','jaqueta','vestido','saia','shorts','short','bermuda','moletom','conjunto','cropped','regata','body','pijama'] ],
    ['ACESSÓRIOS',['meia','meias','boné','bone','cinto','bolsa','carteira','mochila','óculos','oculos','pulseira','colar','brinco','tiara','relógio','relogio'] ]
  ];
  for(var r=0;r<regras.length;r++){
    var grupo=regras[r][0], palavras=regras[r][1];
    for(var i=0;i<palavras.length;i++){
      if(s.indexOf(palavras[i])>=0) return grupo;
    }
  }
  return 'OUTROS';
}

function inferSubcategoriaPorTexto(txt){
  var s=String(txt||'').toLowerCase();
  if(!s) return 'Outros';
  var mapa=[
    ['Sandálias',['sandália','sandalia']],
    ['Chinelos',['chinelo']],
    ['Tênis',['tênis','tenis']],
    ['Sapatos',['sapato']],
    ['Botas',['bota']],
    ['Sapatilhas',['sapatilha']],
    ['Papetes',['papete']],
    ['Camisetas',['camiseta']],
    ['Camisas',['camisa']],
    ['Blusas',['blusa']],
    ['Calças',['calça','calca']],
    ['Calça jeans',['jeans']],
    ['Jaquetas',['jaqueta']],
    ['Vestidos',['vestido']],
    ['Saias',['saia']],
    ['Shorts',['shorts','short','bermuda']],
    ['Moletom',['moletom']],
    ['Conjuntos',['conjunto']],
    ['Meias',['meia','meias']],
    ['Bonés',['boné','bone']],
    ['Cintos',['cinto']],
    ['Bolsas',['bolsa']],
    ['Carteiras',['carteira']],
    ['Mochilas',['mochila']]
  ];
  for(var m=0;m<mapa.length;m++){
    var sub=mapa[m][0], palavras=mapa[m][1];
    for(var j=0;j<palavras.length;j++){
      if(s.indexOf(palavras[j])>=0) return sub;
    }
  }
  return 'Outros';
}

function preencherCategoriasPrincipaisProduto(){
  var grupoEl = document.getElementById('prod-grupo');
  if(!grupoEl) return;
  var atual = grupoEl.value;
  grupoEl.innerHTML = CATEGORIAS_PRINCIPAIS.map(function(grupo){
    return '<option value="' + grupo + '">' + grupo + '</option>';
  }).join('');
  grupoEl.value = CATEGORIAS_PRINCIPAIS.indexOf(atual) >= 0 ? atual : 'ROUPAS';
}

function preencherSubcategoriasProduto(grupoSelecionado, subcatSelecionada){
  var sel = document.getElementById('prod-cat');
  if(!sel) return;
  var grupo = grupoSelecionado || 'ROUPAS';
  var lista = SUBCATEGORIAS_POR_PRINCIPAL[grupo] || SUBCATEGORIAS_POR_PRINCIPAL['OUTROS'];
  sel.innerHTML = lista.map(function(cat){
    return '<option value="' + cat + '">' + cat + '</option>';
  }).join('');
  sel.value = lista.indexOf(subcatSelecionada) >= 0 ? subcatSelecionada : (lista[0] || 'Outros');
}

function atualizarCategoriaPrincipalProduto(){
  var grupoEl = document.getElementById('prod-grupo');
  var subcatEl = document.getElementById('prod-cat');
  if(!grupoEl || !subcatEl) return;
  var grupo = categoriaPrincipalPorSubcategoria(subcatEl.value);
  grupoEl.value = grupo;
}

function categoriaEhCalcado(cat){
  return ["Tênis masculino","Tênis feminino","Tênis infantil","Chinelos","Chinelo infantil","Sandálias","Sandália infantil","Botas","Sapatos","Sapatilhas","Calçados"].indexOf(cat) >= 0;
}

function ncmValidoApp(ncm){
  var s = String(ncm || '').replace(/\D/g, '');
  return s.length === 8 && s !== '00000000';
}

function origemFiscalPorEstoqueApp(origemEstoque){
  origemEstoque = String(origemEstoque || '').toLowerCase();
  if(origemEstoque === 'xml_nfe' || origemEstoque === 'xml_entrada') return 'xml_entrada';
  if(origemEstoque === 'automatico') return 'automatico';
  return 'manual';
}

const CNPJ_BELA_MODAS_FISCAL = '19225338000170';

function somenteDigitosFiscalBM(v){
  return String(v == null ? '' : v).replace(/\D/g, '');
}

function classificarOrigemFiscalProdutoApp(prod, origemEstoque, cnpjDestinatario){
  prod = prod || {};
  var origem = String(origemEstoque || prod.origem_estoque || prod.origem_fiscal || '').toLowerCase();
  var dest = somenteDigitosFiscalBM(cnpjDestinatario || prod.xml_destinatario_cnpj || prod.destinatario_cnpj || prod.cnpj_destinatario || '');
  if(!dest && (origem === 'xml_nfe' || origem === 'xml_entrada')){
    dest = localizarCnpjDestinatarioPorEntradasFiscalBM(prod);
  }

  if(origem === 'xml_nfe' || origem === 'xml_entrada'){
    if(dest && dest === CNPJ_BELA_MODAS_FISCAL) return 'bela_modas';
    if(dest && dest !== CNPJ_BELA_MODAS_FISCAL) return 'outro_cnpj';
    return 'xml_sem_cnpj';
  }

  return 'sem_nota';
}

function rotuloOrigemFiscalProdutoApp(status){
  status = String(status || '').toLowerCase();
  if(status === 'bela_modas') return '🟢 Bela Modas';
  if(status === 'outro_cnpj') return '🟡 Outro CNPJ';
  if(status === 'xml_sem_cnpj') return '🔵 XML sem CNPJ';
  return '🔴 Sem nota';
}

function corOrigemFiscalProdutoApp(status){
  status = String(status || '').toLowerCase();
  if(status === 'bela_modas') return 'var(--green)';
  if(status === 'outro_cnpj') return 'var(--gold)';
  if(status === 'xml_sem_cnpj') return 'var(--blue)';
  return 'var(--red2)';
}

function resolverOrigemNcmProdutoApp(atual, ncmValor, ncmCategoria, origemEstoque){
  var origemAtual = String((atual && (atual.ncm_origem || atual.origem_ncm || atual.origem_fiscal)) || '').toLowerCase();
  var ncmAtual = String((atual && atual.ncm) || '').replace(/\D/g, '');
  var ncmNovo = String(ncmValor || '').replace(/\D/g, '');

  if(origemEstoque === 'xml_nfe' || origemEstoque === 'xml_entrada'){
    return 'xml_entrada';
  }

  if(origemAtual === 'xml_entrada' && ncmValidoApp(ncmNovo) && ncmNovo === ncmAtual){
    return 'xml_entrada';
  }

  if(ncmValidoApp(ncmNovo) && ncmCategoria && ncmNovo === String(ncmCategoria).replace(/\D/g, '')){
    return 'automatico';
  }

  if(ncmValidoApp(ncmNovo)){
    return 'manual';
  }

  return 'automatico';
}

function sugerirCategoriaPorNome(nome){
  var n = String(nome||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ').trim();
  if(!n) return '';

  if(n.includes('tenis infantil')) return 'Tênis infantil';
  if(n.includes('tenis feminino')) return 'Tênis feminino';
  if(n.includes('tenis masculino')) return 'Tênis masculino';
  if(n.includes('chinelo infantil')) return 'Chinelo infantil';
  if(n.includes('chinelo')) return 'Chinelos';
  if(n.includes('sandalia infantil')) return 'Sandália infantil';
  if(n.includes('sandalia')) return 'Sandálias';
  if(n.includes('bota')) return 'Botas';
  if(n.includes('sapato')) return 'Sapatos';
  if(n.includes('sapatilha')) return 'Sapatilhas';
  if(n.includes('bolsa')) return 'Bolsas';
  if(n.includes('mochila')) return 'Mochilas';
  if(n.includes('cinto')) return 'Cintos';
  if(n.includes('carteira')) return 'Carteiras';
  if(n.includes('bone')) return 'Bonés';
  if(n.includes('vestido')) return 'Vestido';
  if(n.includes('saia')) return 'Saia';
  if(n.includes('conjunto moletom infantil')) return 'Conjunto moletom infantil';
  if(n.includes('conjunto moletom masculino')) return 'Conjunto moletom masculino';
  if(n.includes('conjunto moletom feminino')) return 'Conjunto moletom feminino';
  if(n.includes('conjunto moletom') || (n.includes('conjunto') && n.includes('moletom'))) return 'Conjunto moletom feminino';
  if(n.includes('blusa moletom') || n.includes('moletom canguru') || n.includes('moletom')) return 'Blusa moletom';
  if(n.includes('calca moletom')) return 'Calça moletom';
  if(n.includes('blusa masculina')) return 'Blusa masculina';
  if(n.includes('blusa feminina')) return 'Blusa feminina';
  if(n.includes('blusa')) return 'Blusa feminina';
  if(n.includes('camisa')) return 'Camisa masculina';
  if(n.includes('polo')) return 'Polo masculina';
  if(n.includes('camiseta feminina') || n.includes('baby look')) return 'Camiseta feminina';
  if(n.includes('camiseta masculina')) return 'Camiseta masculina';
  if(n.includes('jaqueta feminina')) return 'Jaqueta feminina';
  if(n.includes('jaqueta masculina')) return 'Jaqueta masculina';
  if(n.includes('bermuda')) return 'Bermuda masculina';
  if(n.includes('short')) return 'Short feminino';
  if(n.includes('calca moletom')) return 'Calça moletom';
  if(n.includes('calca feminina') || n.includes('legging')) return 'Calça feminina';
  if(n.includes('calca masculina')) return 'Calça masculina';
  if(n.includes('jeans')) return 'Jeans feminino';
  return '';
}

function sugerirCategoriaAutomaticamente(){
  var nomeEl = document.getElementById('prod-nome');
  var catEl = document.getElementById('prod-cat');
  if(!nomeEl || !catEl) return;
  if(catEl.dataset.manualCategory === '1') return;
  var sugerida = sugerirCategoriaPorNome(nomeEl.value);
  if(!sugerida) return;
  var grupo = categoriaPrincipalPorSubcategoria(sugerida);
  preencherCategoriasProduto(grupo, sugerida);
  catEl = document.getElementById('prod-cat');
  catEl.value = sugerida;
  catEl.dataset.autoCategory = sugerida;
  atualizarCategoriaPrincipalProduto();
  preencherNcmPorCategoria();
  aplicarPadraoFiscal();
}

function preencherNcmPorCategoria(){
  var catEl = document.getElementById('prod-cat');
  var ncmEl = document.getElementById('prod-ncm');
  if(!catEl || !ncmEl) return;
  var atual = String(ncmEl.value || '').trim();
  if(atual) return;
  var ncm = NCM_POR_CATEGORIA[catEl.value] || '';
  if(ncm){
    ncmEl.value = ncm;
    ncmEl.dataset.ncmOrigem = 'automatico';
  }
}


function atualizarNCMAutomatico(){
  var catEl = document.getElementById('prod-cat');
  var ncmEl = document.getElementById('prod-ncm');
  if(!catEl || !ncmEl) return;

  var subcategoria = String(catEl.value || '').trim();
  if(!subcategoria) return;

  var ncmNovo = NCM_POR_CATEGORIA[subcategoria] || '';

  if(ncmNovo && (!ncmValidoApp(ncmEl.value) || ncmEl.dataset.ncmOrigem === 'automatico')){
    ncmEl.value = ncmNovo;
    ncmEl.dataset.ncmOrigem = 'automatico';
  }
}


function aplicarPadraoFiscal(){
  var cat = (document.getElementById('prod-cat') || {}).value || '';
  if(document.getElementById('prod-origem')) document.getElementById('prod-origem').value = '0';
  if(document.getElementById('prod-unidade')) document.getElementById('prod-unidade').value = categoriaEhCalcado(cat) ? 'PAR' : 'UN';
  if(document.getElementById('prod-csosn')) document.getElementById('prod-csosn').value = '102';
  if(document.getElementById('prod-cfop')) document.getElementById('prod-cfop').value = '5102';
  if(document.getElementById('prod-cst-pis')) document.getElementById('prod-cst-pis').value = '49';
  if(document.getElementById('prod-aliq-pis')) document.getElementById('prod-aliq-pis').value = '0';
  if(document.getElementById('prod-cst-cofins')) document.getElementById('prod-cst-cofins').value = '49';
  if(document.getElementById('prod-aliq-cofins')) document.getElementById('prod-aliq-cofins').value = '0';
  if(document.getElementById('prod-escala')) document.getElementById('prod-escala').value = 'S';
  preencherNcmPorCategoria();
}

function entradaManualSemXML(){
  aplicarPadraoFiscal();
  if(document.getElementById('prod-ncm')) document.getElementById('prod-ncm').dataset.ncmOrigem='automatico';
  if(document.getElementById('prod-origem-estoque')) document.getElementById('prod-origem-estoque').value = 'manual_sem_xml';
}

function preencherCategoriasProduto(grupoSelecionado, subcatSelecionada){
  preencherCategoriasPrincipaisProduto();
  var grupoEl = document.getElementById('prod-grupo');
  var grupo = grupoSelecionado || grupoEl.value || 'ROUPAS';
  if(grupoEl) grupoEl.value = CATEGORIAS_PRINCIPAIS.indexOf(grupo) >= 0 ? grupo : 'ROUPAS';
  preencherSubcategoriasProduto(grupo, subcatSelecionada);
  atualizarCategoriaPrincipalProduto();
}

document.addEventListener('DOMContentLoaded', function(){
  preencherCategoriasProduto('ROUPAS', 'Vestido');
  var grupoEl = document.getElementById('prod-grupo');
  var sel = document.getElementById('prod-cat');
  var nomeEl = document.getElementById('prod-nome');
  if(grupoEl){
    grupoEl.addEventListener('change', function(){
      if(sel) sel.dataset.manualCategory = '1';
      preencherSubcategoriasProduto(grupoEl.value);
      preencherNcmPorCategoria();
      aplicarPadraoFiscal();
    });
  }
  if(sel){
    sel.addEventListener('change', function(){
      sel.dataset.manualCategory = '1';
      atualizarCategoriaPrincipalProduto();
      preencherNcmPorCategoria();
      aplicarPadraoFiscal();
    });
  }
  var ncmEl = document.getElementById('prod-ncm');
  if(ncmEl){
    ncmEl.addEventListener('input', function(){
      ncmEl.dataset.ncmOrigem = 'manual';
    });
    ncmEl.addEventListener('change', function(){
      ncmEl.dataset.ncmOrigem = 'manual';
    });
  }
  if(nomeEl){
    nomeEl.addEventListener('input', function(){
      sugerirCategoriaAutomaticamente();
    });
    nomeEl.addEventListener('blur', function(){
      sugerirCategoriaAutomaticamente();
    });
  }
});

var TEMAS={
  vinho:{'--bg':'#f5f0f2','--s1':'#fff','--s2':'#f0eaec','--txt':'#2c0a14','--txt2':'#7a4050','--bdr':'#d4b0b8','--red':'#9c1b3e','--red2':'#c0392b','--green':'#27ae60','--blue':'#2980b9','--gold':'#c0392b','--glow':'rgba(192,57,43,.15)','--sb-bg':'linear-gradient(180deg,#3b0a1e,#1a0509)'},
  escuro:{'--bg':'#1a1a2e','--s1':'#16213e','--s2':'#0f3460','--txt':'#e0e0ff','--txt2':'#9090c0','--bdr':'#2e2e50','--red':'#e74c3c','--red2':'#c0392b','--green':'#27ae60','--blue':'#3498db','--gold':'#f39c12','--glow':'rgba(231,76,60,.15)','--sb-bg':'linear-gradient(180deg,#1e1e36,#0d0d1a)'},
  claro:{'--bg':'#e8e8ed','--s1':'#f5f5f8','--s2':'#dcdce4','--txt':'#1a1a2e','--txt2':'#555577','--bdr':'#c8c8d8','--red':'#c0392b','--red2':'#e74c3c','--green':'#27ae60','--blue':'#2980b9','--gold':'#e67e22','--glow':'rgba(192,57,43,.12)','--sb-bg':'linear-gradient(180deg,#d8d8e2,#c0c0cc)'},
  cinza:{'--bg':'#e8e8ed','--s1':'#f5f5f8','--s2':'#dcdce4','--txt':'#1a1a2e','--txt2':'#555577','--bdr':'#c8c8d8','--red':'#c0392b','--red2':'#e74c3c','--green':'#27ae60','--blue':'#2980b9','--gold':'#e67e22','--glow':'rgba(192,57,43,.12)','--sb-bg':'linear-gradient(180deg,#d8d8e2,#c0c0cc)'},
  branco:{'--bg':'#ffffff','--s1':'#f9f9f9','--s2':'#f0f0f0','--txt':'#111111','--txt2':'#666666','--bdr':'#dddddd','--red':'#c0392b','--red2':'#e74c3c','--green':'#27ae60','--blue':'#2980b9','--gold':'#e67e22','--glow':'rgba(192,57,43,.1)','--sb-bg':'linear-gradient(180deg,#f0f0f0,#e0e0e0)'},
  rosa:{'--bg':'#fce4ec','--s1':'#fff0f5','--s2':'#ffd6e7','--txt':'#880e4f','--txt2':'#ad1457','--bdr':'#f8bbd0','--red':'#e91e63','--red2':'#c2185b','--green':'#27ae60','--blue':'#2980b9','--gold':'#e91e63','--glow':'rgba(233,30,99,.15)','--sb-bg':'linear-gradient(180deg,#f48fb1,#e91e63)'},
  preto:{'--bg':'#0a0a0a','--s1':'#1a1a1a','--s2':'#222222','--txt':'#ffffff','--txt2':'#aaaaaa','--bdr':'#333333','--red':'#e74c3c','--red2':'#c0392b','--green':'#27ae60','--blue':'#3498db','--gold':'#f39c12','--glow':'rgba(231,76,60,.15)','--sb-bg':'linear-gradient(180deg,#111,#000)'},
  verde:{'--bg':'#eaf7ee','--s1':'#f0fff4','--s2':'#d4f0dd','--txt':'#1a3a2a','--txt2':'#2d6a4f','--bdr':'#a8d5b5','--red':'#27ae60','--red2':'#229954','--green':'#1e8449','--blue':'#2980b9','--gold':'#f39c12','--glow':'rgba(39,174,96,.15)','--sb-bg':'linear-gradient(180deg,#1a3a2a,#0d2016)'},
  azul:{'--bg':'#e8f4fd','--s1':'#f0f8ff','--s2':'#d0e8f8','--txt':'#0a1a3b','--txt2':'#1a4a7a','--bdr':'#a0c8e8','--red':'#2980b9','--red2':'#1a6fa0','--green':'#27ae60','--blue':'#1a5276','--gold':'#f39c12','--glow':'rgba(41,128,185,.15)','--sb-bg':'linear-gradient(180deg,#0a1a3b,#050d1e)'},
  lilas:{'--bg':'#f3e8ff','--s1':'#f9f0ff','--s2':'#e8d0ff','--txt':'#2a1a3b','--txt2':'#6a3a9b','--bdr':'#c8a0e8','--red':'#9b59b6','--red2':'#8e44ad','--green':'#27ae60','--blue':'#2980b9','--gold':'#f39c12','--glow':'rgba(155,89,182,.15)','--sb-bg':'linear-gradient(180deg,#2a1a3b,#15091e)'},
  laranja:{'--bg':'#fff3e0','--s1':'#fff8f0','--s2':'#ffe0b2','--txt':'#2a1500','--txt2':'#7a4010','--bdr':'#ffcc80','--red':'#e67e22','--red2':'#d35400','--green':'#27ae60','--blue':'#2980b9','--gold':'#e67e22','--glow':'rgba(230,126,34,.15)','--sb-bg':'linear-gradient(180deg,#2a1500,#150a00)'},
  cafe:{'--bg':'#f5ebe0','--s1':'#fdf6ee','--s2':'#e8d5c0','--txt':'#2a1a0a','--txt2':'#6b4226','--bdr':'#d4a882','--red':'#8B5E3C','--red2':'#6F4E37','--green':'#27ae60','--blue':'#2980b9','--gold':'#d4a017','--glow':'rgba(139,94,60,.15)','--sb-bg':'linear-gradient(180deg,#2a1a0a,#150d05)'},
  natal:{'--bg':'#f0fff0','--s1':'#f8fff8','--s2':'#d4f0d4','--txt':'#0a2a0a','--txt2':'#1a5a1a','--bdr':'#90c090','--red':'#c0392b','--red2':'#e74c3c','--green':'#1e8449','--blue':'#2980b9','--gold':'#f1c40f','--glow':'rgba(192,57,43,.15)','--sb-bg':'linear-gradient(180deg,#0a2a0a,#051405)'}
};

var _st=null, _sy=false;
function setSS(s,m){
  var d=document.getElementById('sdot'), t=document.getElementById('stxt');
  if(d) d.className='sdot '+s;
  if(t) t.textContent=m;
}
function scheduleSync(){
  clearTimeout(_st);
  _st=setTimeout(function(){
    try{
      if(window.BelaSheetsSync && typeof window.BelaSheetsSync.scheduleSync==='function'){
        window.BelaSheetsSync.scheduleSync();
      }
      setSS('sync','Sincronizando...');
    }catch(e){}
  }, 1200);
}
function syncUp(){
  try{
    if(window.BelaSheetsSync && typeof window.BelaSheetsSync.syncNow==='function'){
      setSS('sync','Sincronizando...');
      return window.BelaSheetsSync.syncNow();
    }
  }catch(e){}
}
function syncNow(){
  return syncUp();
}
function syncDown(){
  try{
    if(window.BelaSheetsSync && typeof window.BelaSheetsSync.syncNow==='function'){
      setSS('sync','Carregando...');
      return window.BelaSheetsSync.syncNow();
    }
  }catch(e){}
}
var DB={
  get:function(k){try{var v=localStorage.getItem('bm_'+k);return v?JSON.parse(v):[];}catch(e){return[];}},
  set:function(k,v){
    localStorage.setItem('bm_'+k,JSON.stringify(v));
    if(window.BelaSheetsSync && typeof window.BelaSheetsSync.scheduleSync==='function'){
      window.BelaSheetsSync.scheduleSync();
    }
  },
  uid:function(){return Date.now().toString(36)+Math.random().toString(36).substr(2,4);}
};

function initDB(){
  if(localStorage.getItem('bm_ok2'))return;
  DB.set('clientes',[
    {id:'c1',nome:'Maria Silva',cpf:'123.456.789-00',tel:'31991112222',end:'Rua das Flores, 10',obs:'VIP'},
    {id:'c2',nome:'Ana Costa',cpf:'987.654.321-00',tel:'31983334444',end:'Av. Central, 55',obs:''}
  ]);
  DB.set('produtos',[
    {id:'p1',cod:'VF001',nome:'Vestido Floral Rosa',cat:'Vestidos',preco:89.90,estq:10,desc2:'Tamanho P/M/G'},
    {id:'p2',cod:'BL002',nome:'Blusa Rendada Branca',cat:'Blusas',preco:49.90,estq:15,desc2:''},
    {id:'p3',cod:'SA003',nome:'Saia Midi Preta',cat:'Saias',preco:69.90,estq:8,desc2:''},
    {id:'p4',cod:'AC004',nome:'Colar Dourado',cat:'Acessórios',preco:29.90,estq:20,desc2:''}
  ]);
  DB.set('vendas',[]);DB.set('creditos',[]);DB.set('pagamentos',[]);
  localStorage.setItem('bm_ok2','1');
}

function R(v){return 'R$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function nowLocalISO(){
  var n=new Date();
  return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')+'T'+
    String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
}
function todayLocalISO(){
  return nowLocalISO().slice(0,10);
}
function parseAnyDate(v){
  if(!v) return null;
  if(v instanceof Date) return isNaN(v.getTime()) ? null : v;
  var s=String(v).trim();
  var m=s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if(m){
    var d1=new Date(
      Number(m[1]),
      Number(m[2])-1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6]||0)
    );
    return isNaN(d1.getTime()) ? null : d1;
  }
  var d2=new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}
function FD(d){
  var x=parseAnyDate(d);
  return x ? x.toLocaleDateString('pt-BR') : '';
}
function FDT(d){
  var x=parseAnyDate(d);
  return x ? x.toLocaleString('pt-BR') : '';
}
function FF(f){return{dinheiro:'💵 Dinheiro',pix:'📱 PIX',credito:'💳 Crédito',debito:'💳 Débito',fiado:'📋 Crediário',dividido:'🔀 Pagamento dividido'}[f]||f;}
function pagamentosVendaLista(v){
  if(v && Array.isArray(v.pagamentos) && v.pagamentos.length){
    return v.pagamentos.map(function(p){
      return {forma:String(p.forma||'').toLowerCase(), valor:dinheiroNum(p.valor!=null?p.valor:(p.val!=null?p.val:0))};
    }).filter(function(p){ return p.forma && p.valor>0; });
  }
  if(!v) return [];
  return [{forma:String(v.forma||'').toLowerCase(), valor:dinheiroNum(v.total||0)}];
}
function textoPagamentosVenda(v){
  var lista=pagamentosVendaLista(v);
  if(!lista.length) return FF(v && v.forma);
  if(lista.length===1) return FF(lista[0].forma);
  return lista.map(function(p){ return FF(p.forma)+': '+R(p.valor); }).join(' | ');
}
function somaVendasPorForma(vendas){
  var formas={};
  (vendas||[]).forEach(function(v){
    pagamentosVendaLista(v).forEach(function(p){
      if(p.forma==='fiado') return;
      formas[p.forma]=(formas[p.forma]||0)+p.valor;
    });
  });
  return formas;
}
function ajustarEstoqueVenda(itens, modo){
  modo = (modo === 'somar') ? 'somar' : 'subtrair';
  var produtos = DB.get('produtos') || [];
  var alterou = false;

  (itens || []).forEach(function(it){
    if(!it) return;

    var pid = it.pid || it.produto_id || it.idProduto || it.id;
    if(!pid) return;

    var qtd = Number(it.qtd || it.qty || it.quantidade || 0);
    if(!isFinite(qtd) || qtd <= 0) return;

    var p = produtos.find(function(x){
      return String(x.id) === String(pid);
    });
    if(!p) return;

    var estoqueAtual = Number(
      p.estq != null ? p.estq : (p.estoque != null ? p.estoque : 0)
    );
    if(!isFinite(estoqueAtual)) estoqueAtual = 0;

    if(modo === 'subtrair'){
      p.estq = Math.max(0, estoqueAtual - qtd);
    }else{
      p.estq = estoqueAtual + qtd;
    }
    alterou = true;
  });

  if(alterou){
    DB.set('produtos', produtos);
  }
}
function vendasIdsSet(){
  return new Set((DB.get('vendas')||[]).map(function(v){ return String(v.id||''); }));
}
function creditosValidos(){
  var ids=vendasIdsSet();
  return (DB.get('creditos')||[]).filter(function(c){
    if(!c || c.deletedAt) return false;
    if(!c.vid) return true;
    return ids.has(String(c.vid));
  });
}
function pagamentosValidos(){
  var ids=vendasIdsSet();
  return (DB.get('pagamentos')||[]).filter(function(p){
    if(!p || p.deletedAt) return false;
    var vid=String(p.vid || p.venda_id || '');
    if(!vid) return true;
    if(vid.indexOf('cid:')===0) return true;
    return ids.has(vid);
  });
}
function limparDebitosOrfaos(){
  try{
    var ids=vendasIdsSet();
    DB.set('creditos', (DB.get('creditos')||[]).filter(function(c){
      if(!c || c.deletedAt) return false;
      if(!c.vid) return true;
      return ids.has(String(c.vid));
    }));
    if(Array.isArray(DB.get('fiados'))){
      DB.set('fiados', (DB.get('fiados')||[]).filter(function(f){
        if(!f || f.deletedAt) return false;
        if(!f.vid) return true;
        return ids.has(String(f.vid));
      }));
    }
    DB.set('pagamentos', (DB.get('pagamentos')||[]).filter(function(p){
      if(!p || p.deletedAt) return false;
      var vid=String(p.vid || p.venda_id || '');
      if(!vid) return true;
      if(vid.indexOf('cid:')===0) return true;
      return ids.has(vid);
    }));
  }catch(e){}
}
function mcpf(el){var v=el.value.replace(/\D/g,'').substr(0,11);v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');el.value=v;}
function dinheiroNum(v){
  if(v==null||v==='') return 0;
  if(typeof v==='number') return isFinite(v)?v:0;
  var s=String(v).trim();
  if(!s) return 0;
  s=s.replace(/\s+/g,'');
  if(s.indexOf(',')>=0) s=s.replace(/\./g,'').replace(',', '.');
  else s=s.replace(/,/g,'');
  var n=parseFloat(s.replace(/[^0-9.-]/g,''));
  return isFinite(n)?n:0;
}
function fmtLimiteInput(v){
  var n=dinheiroNum(v);
  if(!n) return '';
  return n.toFixed(2).replace('.',',');
}
function limiteClienteValor(cli){
  return dinheiroNum(cli&&((cli.limite_credito!=null&&cli.limite_credito!=='')?cli.limite_credito:cli.limite));
}
var _limiteCliPendente=null;
function dadosLimiteCliente(cli){
  var limite=limiteClienteValor(cli);
  var emAberto=saldo(cli.id).sd;
  var faixa=limite*0.2;
  var faltam=Math.max(0, limite-emAberto);
  return {cliente:cli,limite:limite,emAberto:emAberto,faixa:faixa,faltam:faltam,excedeu:limite>0&&emAberto>limite,alerta:limite>0&&emAberto<=limite&&faltam<=faixa};
}
function verificarLimiteClienteVenda(cli){
  var info=dadosLimiteCliente(cli);
  if(!info.limite) return;
  if(!info.excedeu && !info.alerta) return;
  _limiteCliPendente=cli;
  var card=document.getElementById('limite-card');
  var badge=document.getElementById('limite-badge');
  var msg=document.getElementById('limite-msg');
  var cliente=document.getElementById('limite-cliente');
  var valor=document.getElementById('limite-valor');
  var saldoEl=document.getElementById('limite-saldo');
  var restante=document.getElementById('limite-restante');
  cliente.textContent=cli.nome||'Cliente';
  valor.textContent=R(info.limite);
  saldoEl.textContent=R(info.emAberto);
  if(info.excedeu){
    card.style.background='rgba(192,57,43,.10)';
    card.style.borderColor='rgba(192,57,43,.35)';
    badge.style.background='rgba(192,57,43,.15)';
    badge.style.color='var(--red)';
    badge.textContent='Limite ultrapassado';
    msg.textContent='Cliente já ultrapassou o limite de compras. Deseja continuar?';
    restante.textContent='Excedeu '+R(info.emAberto-info.limite);
    restante.style.color='var(--red2)';
  }else{
    card.style.background='rgba(184,134,11,.10)';
    card.style.borderColor='rgba(184,134,11,.35)';
    badge.style.background='rgba(184,134,11,.15)';
    badge.style.color='var(--gold)';
    badge.textContent='Próximo do limite';
    msg.textContent='Faltam '+R(info.faltam)+' para atingir o limite. Deseja continuar?';
    restante.textContent='Faltam '+R(info.faltam);
    restante.style.color='var(--gold)';
  }
  abrirMd('mo-limite-cli');
}
function continuarAlertaLimiteCliente(){
  _limiteCliPendente=null;
  fMd('mo-limite-cli');
  // Se há atraso pendente, abre o modal de atraso em seguida
  if(_atrasoCliPendente){
    var c=_atrasoCliPendente;
    _atrasoCliPendente=null;
    setTimeout(function(){ verificarAtrasoClienteVenda(c); }, 200);
  }
}
function cancelarAlertaLimiteCliente(){
  _limiteCliPendente=null;
  try{ _atrasoCliPendente = null; }catch(e){}
  fMd('mo-limite-cli');
  remCli();
}

/* ── ALERTA ATRASO (> 30 dias sem pagamento) ── */
var _atrasoCliPendente=null;
function dadosAtrasoCliente(cli){
  if(!cli||!cli.id) return null;
  var sd=saldo(cli.id).sd;
  if(sd<=0) return null;
  var dias=diasSemPag(cli.id);
  if(dias<=30) return null;
  // data de referência: último pagamento ou primeira compra
  var pgs=pagamentosValidos().filter(function(p){return p.cid===cli.id;});
  var dataRef='';
  if(pgs.length){
    dataRef=pgs.slice().sort(function(a,b){return new Date(b.data)-new Date(a.data);})[0].data||'';
  }else{
    var crds=creditosValidos().filter(function(f){return f.cid===cli.id;});
    if(crds.length) dataRef=crds.slice().sort(function(a,b){return new Date(a.data)-new Date(b.data);})[0].data||'';
  }
  return {cliente:cli, dias:dias, saldo:sd, dataRef:dataRef};
}
function verificarAtrasoClienteVenda(cli){
  var info=dadosAtrasoCliente(cli);
  if(!info) return;
  _atrasoCliPendente=cli;
  document.getElementById('atraso-cliente').textContent=cli.nome||'Cliente';
  document.getElementById('atraso-dias').textContent=info.dias+' dias';
  document.getElementById('atraso-saldo').textContent=R(info.saldo);
  document.getElementById('atraso-data').textContent=info.dataRef?(typeof FD==='function'?FD(info.dataRef):info.dataRef):'-';
  abrirMd('mo-atraso-cli');
}
function continuarAlertaAtrasoCliente(){
  _atrasoCliPendente=null;
  fMd('mo-atraso-cli');
}
function cancelarAlertaAtrasoCliente(){
  _atrasoCliPendente=null;
  fMd('mo-atraso-cli');
  remCli();
}

function saldo(cid){
  var tf=creditosValidos().filter(function(f){return f.cid===cid;}).reduce(function(s,f){return s+Number(f.val||0);},0);
  var tp=pagamentosValidos().filter(function(p){return p.cid===cid;}).reduce(function(s,p){return s+Number(p.val||0);},0);
  return{tf:tf,tp:tp,sd:Math.max(0, tf-tp)};
}
function diasSemPag(cid){
  var TOLERANCIA_QUITACAO = 1.00;

  var crds = creditosValidos()
    .filter(function(f){return f.cid===cid;})
    .sort(function(a,b){return new Date(a.data)-new Date(b.data);});

  var pgs = pagamentosValidos()
    .filter(function(p){return p.cid===cid;})
    .sort(function(a,b){return new Date(a.data)-new Date(b.data);});

  if(!crds.length)return 0;

  var totalCompras = crds.reduce(function(s,c){
    return s + dinheiroNum(c.val!=null?c.val:c.valor);
  },0);

  var totalPagamentos = pgs.reduce(function(s,p){
    return s + dinheiroNum(p.val!=null?p.val:p.valor);
  },0);

  // Se a diferença for até R$ 1,00, considera quitado e não há atraso.
  if(totalCompras - totalPagamentos <= TOLERANCIA_QUITACAO)return 0;

  var acumuladoCompras = 0;
  var primeiraCompraAberta = null;

  for(var i=0;i<crds.length;i++){
    acumuladoCompras += dinheiroNum(crds[i].val!=null?crds[i].val:crds[i].valor);

    // Encontra a primeira compra que ainda ficou em aberto depois dos pagamentos.
    if(acumuladoCompras - totalPagamentos > TOLERANCIA_QUITACAO){
      primeiraCompraAberta = crds[i];
      break;
    }
  }

  if(!primeiraCompraAberta)return 0;

  var dataRef = new Date(primeiraCompraAberta.data);

  // Se houve pagamento depois dessa compra em aberto, a contagem recomeça no último pagamento.
  // Isso evita marcar atraso antigo quando o cliente fez pagamento parcial recentemente.
  if(pgs.length){
    var ultimoPagamento = new Date(pgs[pgs.length-1].data);
    if(!isNaN(ultimoPagamento.getTime()) && ultimoPagamento > dataRef){
      dataRef = ultimoPagamento;
    }
  }

  if(isNaN(dataRef.getTime()))return 0;

  return Math.floor((new Date()-dataRef)/(1000*60*60*24));
}

function lerDeletedStore(nome){
  try{
    return JSON.parse(localStorage.getItem('bm_deleted_'+nome) || '[]');
  }catch(e){
    return [];
  }
}
function salvarDeletedStore(nome, lista){
  localStorage.setItem('bm_deleted_'+nome, JSON.stringify(lista||[]));
}
function registrarDeletedStore(nome, item){
  if(!item || !item.id) return;
  var agora = new Date().toISOString();
  var tomb = Object.assign({}, item, {
    deletedAt: item.deletedAt || agora,
    updatedAt: agora
  });
  var lista = lerDeletedStore(nome);
  var idx = lista.findIndex(function(x){ return String(x && x.id || '') === String(tomb.id); });
  if(idx >= 0) lista[idx] = Object.assign({}, lista[idx], tomb);
  else lista.push(tomb);
  salvarDeletedStore(nome, lista);
}
function registrarDeletedLote(nome, itens){
  (itens||[]).forEach(function(item){ registrarDeletedStore(nome, item); });
}

function limparDeletedProdutosLegadoBM(){
  // Este sistema agora exclui produto direto da lista local e do syncAll.
  // Remove o lixo antigo de bm_deleted_produtos que podia deixar o navegador lento.
  try{ localStorage.removeItem('bm_deleted_produtos'); }catch(e){}
}
limparDeletedProdutosLegadoBM();

function toast(msg,tipo){
  var t=document.getElementById('toast');
  t.textContent=msg;
  t.style.background=tipo==='ok'?'#27ae60':tipo==='info'?'#2471a3':tipo==='warn'?'#e67e22':'#c0392b';
  t.classList.add('on');clearTimeout(t._t);
  t._t=setTimeout(function(){t.classList.remove('on');},3000);
}
function abrirMd(id){document.querySelectorAll('.ov.on').forEach(function(m){ if(m.id!==id) m.classList.remove('on'); });document.getElementById(id).classList.add('on');}
function fMd(id){document.getElementById(id).classList.remove('on');}

function tick(){
  var n=new Date();
  document.getElementById('clk').textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
  var D=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],M=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  document.getElementById('dat').textContent=D[n.getDay()]+', '+n.getDate()+' '+M[n.getMonth()];
}
setInterval(tick,1000);tick();

var _navMap={'dash':0,'venda':1,'receb':2,'cobranca':3,'clientes':4,'produtos':5,'balanco':6,'caixa':7,'crediario':8,'vendas':9,'relatorio':10,'config':11};
var _relatorioLiberado=false;

function ir(pg){
  if(pg==='relatorio' && !_relatorioLiberado){
    pedirSenha(function(){ _relatorioLiberado=true; ir('relatorio'); });
    return;
  }
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.nv').forEach(function(n){n.classList.remove('on');});
  var pgEl=document.getElementById('pg-'+pg);
  if(pgEl) pgEl.classList.add('on');
  var navs=document.querySelectorAll('.nv');
  if(_navMap[pg]!==undefined && navs[_navMap[pg]]) navs[_navMap[pg]].classList.add('on');
  var sb=document.getElementById('sb');
  if(pg==='venda'){ if(sb) sb.classList.add('mini'); }
  else { if(sb) sb.classList.remove('mini'); }
  if(pg==='dash')renderDash();
  if(pg==='venda')initVenda();
  if(pg==='receb')initReceb();
  if(pg==='cobranca')renderCobranca();
  if(pg==='clientes')renderClis();
  if(pg==='produtos')renderProds();
  if(pg==='balanco')initBalancoReal();
  if(pg==='caixa'){renderCaixa(); setTimeout(realocarBotaoNfcePendentesCaixa, 50);}
  if(pg==='crediario')renderCrediario();
  if(pg==='vendas'){setTimeout(renderVendas,50);}
  if(pg==='config')initConfig();
  if(pg==='relatorio')renderRel();
}

// DASHBOARD
function renderDash(){
  setTimeout(function(){ limparBotoesObsoletosBackupXml(); inserirBotoesBackupFiscalNoPainelSync(); }, 120); // ajuste-backup-renderDash
  var n=new Date(),hoje=todayLocalISO(),mes=n.getMonth(),ano=n.getFullYear();
  document.getElementById('dash-dt').textContent=n.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var vendas=DB.get('vendas'),clis=DB.get('clientes');
  var vh=vendas.filter(function(v){return v.data.startsWith(hoje);});
  var tvh=vh.filter(function(v){return v.forma!=='fiado';}).reduce(function(s,v){return s+v.total;},0);
  var tmes=vendas.filter(function(v){var d=new Date(v.data);return d.getMonth()===mes&&d.getFullYear()===ano&&v.forma!=='fiado';}).reduce(function(s,v){return s+v.total;},0);
  var totalFiad=clis.reduce(function(s,c){return s+saldo(c.id).sd;},0);
  var inad=clis.filter(function(c){return saldo(c.id).sd>0.01&&diasSemPag(c.id)>=30;});
  document.getElementById('d-stats').innerHTML=
    '<div class="st stg"><div class="sl">Vendas Hoje</div><div class="sv">'+R(tvh)+'</div><span class="tm">'+vh.length+' venda(s)</span></div>'+
    '<div class="st str"><div class="sl">Crediário em Aberto</div><div class="sv">'+R(totalFiad)+'</div></div>'+
    '<div class="st stgo"><div class="sl">Receita do Mês</div><div class="sv">'+R(tmes)+'</div></div>'+
    '<div class="st sto"><div class="sl">Inadimplentes +30d</div><div class="sv">'+inad.length+'</div><span class="tm" style="cursor:pointer;color:var(--orange);" onclick="ir(\'cobranca\')">Ver lista →</span></div>';
  var uv=vendas.slice(-6).reverse().map(function(v){
    return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--bdr);font-size:12px;">'+
      '<span><b>'+v.cliNome+'</b><br><span class="tm">'+FD(v.data)+' · '+textoPagamentosVenda(v)+'</span></span>'+
      '<span class="txt-g">'+R(v.total)+'</span></div>';
  }).join('');
  document.getElementById('d-uv').innerHTML=uv||'<div class="empty">Nenhuma venda ainda</div>';
  var inadHtml=inad.slice(0,5).map(function(c){
    var sd=saldo(c.id).sd,dias=diasSemPag(c.id);
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bdr);font-size:12px;">'+
      '<span><b>'+c.nome+'</b><br><span style="color:var(--orange);font-size:11px;">'+dias+' dias sem pagar</span></span>'+
      '<span style="display:flex;gap:6px;align-items:center;"><b class="txt-r">'+R(sd)+'</b>'+
      (c.tel?'<button class="btn bo xs" onclick="wppCobrar(\''+c.id+'\')">📱</button>':'')+
      '</span></div>';
  }).join('');
  document.getElementById('d-inad').innerHTML=inadHtml||'<div class="empty">Nenhum inadimplente +30 dias 🎉</div>';
  if(inad.length>5)document.getElementById('d-inad').innerHTML+='<div style="text-align:center;margin-top:8px;"><span style="color:var(--orange);cursor:pointer;font-size:12px;font-weight:700;" onclick="ir(\'cobranca\')">Ver todos os '+inad.length+' →</span></div>';
}


// REVISÃO DE LIMITES DO CREDIÁRIO
function arredLimite50_(v){
  v=Number(v)||0;
  if(v<=0) return 0;
  return Math.round(v/50)*50;
}

function creditosCliente_(cid){
  return creditosValidos().filter(function(c){return String(c.cid||'')===String(cid);});
}

function pagamentosCliente_(cid){
  return pagamentosValidos().filter(function(p){return String(p.cid||'')===String(cid);});
}

function calcularSugestaoLimiteCliente(cli){
  var atual=limiteClienteValor(cli);
  var crds=creditosCliente_(cli.id);
  var pgs=pagamentosCliente_(cli.id);
  var totalComprado=crds.reduce(function(s,c){return s+dinheiroNum(c.val!=null?c.val:c.valor);},0);
  var totalPago=pgs.reduce(function(s,p){return s+dinheiroNum(p.val!=null?p.val:p.valor);},0);
  var saldoAtual=saldo(cli.id).sd;
  var qtdCompras=crds.length;
  var qtdPagamentos=pgs.length;
  var ticketMedio=qtdCompras?totalComprado/qtdCompras:0;
  var taxa=totalComprado>0?Math.min(totalPago/totalComprado,1.2):0;
  var dias=diasSemPag(cli.id);

  var ptsPontualidade=0;
  if(totalComprado<=0){
    ptsPontualidade=18;
  }else if(saldoAtual<=0.01){
    ptsPontualidade=40;
  }else if(dias<=5){
    ptsPontualidade=34;
  }else if(dias<=15){
    ptsPontualidade=25;
  }else if(dias<=30){
    ptsPontualidade=14;
  }else{
    ptsPontualidade=3;
  }

  var ptsCapacidade=0;
  if(totalComprado<=0){
    ptsCapacidade=8;
  }else if(taxa>=0.90){
    ptsCapacidade=25;
  }else if(taxa>=0.70){
    ptsCapacidade=18;
  }else if(taxa>=0.50){
    ptsCapacidade=10;
  }else if(taxa>=0.30){
    ptsCapacidade=5;
  }else{
    ptsCapacidade=0;
  }

  var ptsVolume=0;
  if(totalComprado>=1500) ptsVolume=15;
  else if(totalComprado>=800) ptsVolume=12;
  else if(totalComprado>=400) ptsVolume=8;
  else if(totalComprado>=150) ptsVolume=5;
  else if(totalComprado>0) ptsVolume=2;

  var ptsTicket=0;
  if(ticketMedio>=300) ptsTicket=10;
  else if(ticketMedio>=200) ptsTicket=8;
  else if(ticketMedio>=120) ptsTicket=6;
  else if(ticketMedio>=60) ptsTicket=3;
  else if(ticketMedio>0) ptsTicket=1;

  var ptsHistorico=Math.min(5, Math.floor((qtdCompras+qtdPagamentos)/2));
  var ptsSituacao=0;
  if(saldoAtual<=0.01) ptsSituacao=5;
  else if(atual>0 && saldoAtual<=atual) ptsSituacao=3;
  else if(atual<=0 && saldoAtual>0) ptsSituacao=1;
  else ptsSituacao=0;

  var score=ptsPontualidade+ptsCapacidade+ptsVolume+ptsTicket+ptsHistorico+ptsSituacao;

  if(totalComprado>0 && taxa<0.30 && saldoAtual>0.01) score=Math.min(score,35);
  if(saldoAtual>0.01 && dias>45) score=Math.min(score,25);
  score=Math.max(0, Math.min(100, Math.round(score)));

  var multiplicador=0;
  if(totalComprado<=0){
    multiplicador=0;
  }else if(score>=90){
    multiplicador=4;
  }else if(score>=70){
    multiplicador=3;
  }else if(score>=50){
    multiplicador=2;
  }else if(score>=30){
    multiplicador=1;
  }else{
    multiplicador=0;
  }

  var sugerido=arredLimite50_((ticketMedio||0)*multiplicador);

  if(score>=50 && saldoAtual>0) sugerido=Math.max(sugerido, arredLimite50_(saldoAtual));
  sugerido=Math.min(sugerido, 1200);
  if(totalComprado<=0) sugerido=atual;

  var acao='manter';
  if(score<30 && atual>0) acao='bloquear';
  else if(sugerido>atual+25) acao='aumentar';
  else if(sugerido<atual-25) acao='reduzir';

  var motivo=[];
  motivo.push('Pontualidade '+ptsPontualidade+'/40');
  motivo.push('Pagamento '+ptsCapacidade+'/25');
  if(totalComprado>0) motivo.push('Comprou '+R(totalComprado));
  if(saldoAtual>0.01) motivo.push('Saldo '+R(saldoAtual));
  if(dias>0 && saldoAtual>0.01) motivo.push(dias+' dias sem pagar');
  if(totalComprado>0 && taxa<0.50) motivo.push('taxa de pagamento baixa');

  return {
    cliente:cli,
    atual:atual,
    sugerido:sugerido,
    score:score,
    taxa:taxa,
    totalComprado:totalComprado,
    totalPago:totalPago,
    saldoAtual:saldoAtual,
    ticketMedio:ticketMedio,
    dias:dias,
    qtdCompras:qtdCompras,
    acao:acao,
    motivo:motivo.join(' • ')
  };
}

function classeScoreLimite_(score){
  if(score>=70) return 'alto';
  if(score>=40) return 'medio';
  return 'baixo';
}

function labelAcaoLimite_(r){
  if(r.acao==='aumentar') return '<span class="lim-acao lim-up">↑ Aumentar</span>';
  if(r.acao==='reduzir') return '<span class="lim-acao lim-down">↓ Reduzir</span>';
  if(r.acao==='bloquear') return '<span class="lim-acao lim-block">⛔ Bloquear</span>';
  return '<span class="tm">Manter</span>';
}

function abrirRevisaoLimites(){
  abrirMd('mo-limites');
  renderRevisaoLimites();
}

function getRevisoesLimites_(){
  return (DB.get('clientes')||[]).map(calcularSugestaoLimiteCliente)
    .sort(function(a,b){
      var peso={bloquear:4,reduzir:3,aumentar:2,manter:1};
      return (peso[b.acao]||0)-(peso[a.acao]||0) || a.score-b.score || (b.totalComprado-a.totalComprado);
    });
}

function renderRevisaoLimites(){
  var filtro=(document.getElementById('lim-filtro')||{}).value||'alterar';
  var lista=getRevisoesLimites_();
  var total=lista.length;
  var aumentar=lista.filter(function(r){return r.acao==='aumentar';}).length;
  var reduzir=lista.filter(function(r){return r.acao==='reduzir';}).length;
  var bloquear=lista.filter(function(r){return r.acao==='bloquear';}).length;

  var st=document.getElementById('lim-stats');
  if(st) st.innerHTML=
    '<div class="st stb"><div class="sl">Clientes analisados</div><div class="sv">'+total+'</div></div>'+
    '<div class="st stg"><div class="sl">Aumentar</div><div class="sv">'+aumentar+'</div></div>'+
    '<div class="st sto"><div class="sl">Reduzir</div><div class="sv">'+reduzir+'</div></div>'+
    '<div class="st str"><div class="sl">Bloquear</div><div class="sv">'+bloquear+'</div></div>';

  if(filtro==='alterar') lista=lista.filter(function(r){return r.acao!=='manter';});
  else if(filtro!=='todos') lista=lista.filter(function(r){return r.acao===filtro;});

  var rows=lista.map(function(r){
    var pct=r.totalComprado>0?(r.taxa*100):0;
    var taxaTxt=r.totalComprado>0?pct.toFixed(0).replace('.',',')+'%':'sem histórico';
    var btn=(r.acao==='manter')
      ? '<span class="tm">Sem alteração</span>'
      : "<button class=\"btn br xs\" onclick=\"aplicarSugestaoLimite('"+r.cliente.id+"')\">Aplicar</button>";
    return '<tr>'+
      '<td><b>'+r.cliente.nome+'</b><div class="lim-info">'+r.qtdCompras+' compra(s) crediário • ticket '+R(r.ticketMedio||0)+'</div></td>'+
      '<td><b>'+((r.atual||0)>0?R(r.atual):'—')+'</b></td>'+
      '<td><b style="color:var(--gold)">'+((r.sugerido||0)>0?R(r.sugerido):'R$ 0,00')+'</b><br>'+labelAcaoLimite_(r)+'</td>'+
      '<td><span class="lim-score '+classeScoreLimite_(r.score)+'">'+r.score+'</span></td>'+
      '<td><b>'+taxaTxt+'</b><div class="lim-info">Pago '+R(r.totalPago||0)+'</div></td>'+
      '<td><div class="lim-info">'+r.motivo+'</div></td>'+
      '<td>'+btn+'</td>'+
    '</tr>';
  }).join('');

  var tb=document.getElementById('lim-tb');
  if(tb) tb.innerHTML=rows||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--txt2);">Nenhuma sugestão para este filtro.</td></tr>';
}

function aplicarSugestaoLimite(cid){
  var cli=(DB.get('clientes')||[]).find(function(c){return String(c.id)===String(cid);});
  if(!cli){toast('⚠️ Cliente não encontrado!');return;}
  var rev=calcularSugestaoLimiteCliente(cli);
  if(rev.acao==='manter'){toast('ℹ️ Sem alteração sugerida.');return;}

  var msg='Aplicar novo limite para '+(cli.nome||'cliente')+'?\n\n'+
    'Limite atual: '+R(rev.atual||0)+'\n'+
    'Limite sugerido: '+R(rev.sugerido||0)+'\n'+
    'Score: '+rev.score+'\n\n'+
    'A venda continuará apenas com alerta caso ultrapasse o limite.';
  if(!confirm(msg)) return;

  pedirSenha(function(){
    var clis=DB.get('clientes')||[];
    var idx=clis.findIndex(function(c){return String(c.id)===String(cid);});
    if(idx<0){toast('⚠️ Cliente não encontrado!');return;}
    var agora=(typeof nowLocalISO==='function') ? nowLocalISO() : new Date().toISOString();
    clis[idx].limite_credito=Number(rev.sugerido||0);
    clis[idx].limite=Number(rev.sugerido||0);
    clis[idx].limite_revisado_em=agora;
    clis[idx].updatedAt=agora;
    DB.set('clientes',clis);
    renderClis();
    renderRevisaoLimites();
    toast('✅ Limite atualizado para '+R(rev.sugerido||0),'ok');
  });
}

function montarCacheLimiteClientesBM(mapaSaldo){
  // Cache leve para manter a sugestão de limite visível sem recalcular filtros pesados a cada linha.
  var cache={mapa:{}, hoje:+new Date()};
  (creditosValidos()||[]).forEach(function(c){
    var id=String(c.cid||'');
    if(!id) return;
    var r=cache.mapa[id]||(cache.mapa[id]={totalComprado:0,totalPago:0,qtdCompras:0,qtdPagamentos:0,primeiroCredito:null,ultimoPagamento:null,saldoAtual:0});
    r.totalComprado += dinheiroNum(c.val!=null?c.val:c.valor);
    r.qtdCompras++;
    var d=+new Date(c.data||c.createdAt||0);
    if(isFinite(d) && d>0 && (r.primeiroCredito===null || d<r.primeiroCredito)) r.primeiroCredito=d;
  });
  (pagamentosValidos()||[]).forEach(function(p){
    var id=String(p.cid||'');
    if(!id) return;
    var r=cache.mapa[id]||(cache.mapa[id]={totalComprado:0,totalPago:0,qtdCompras:0,qtdPagamentos:0,primeiroCredito:null,ultimoPagamento:null,saldoAtual:0});
    r.totalPago += dinheiroNum(p.val!=null?p.val:p.valor);
    r.qtdPagamentos++;
    var d=+new Date(p.data||p.createdAt||0);
    if(isFinite(d) && d>0 && (r.ultimoPagamento===null || d>r.ultimoPagamento)) r.ultimoPagamento=d;
  });
  Object.keys(cache.mapa).forEach(function(id){
    var m=cache.mapa[id];
    if(mapaSaldo && mapaSaldo[id]) m.saldoAtual=Number(mapaSaldo[id].sd||0);
    else m.saldoAtual=Math.max(0,(m.totalComprado||0)-(m.totalPago||0));
  });
  return cache;
}

function calcularSugestaoLimiteClienteCacheBM(cli, cache){
  // Mesma lógica de calcularSugestaoLimiteCliente(), mas usando dados pré-carregados.
  if(!cache) return calcularSugestaoLimiteCliente(cli);
  var atual=limiteClienteValor(cli);
  var id=String(cli&&cli.id||'');
  var m=(cache.mapa&&cache.mapa[id])||{};
  var totalComprado=Number(m.totalComprado||0);
  var totalPago=Number(m.totalPago||0);
  var saldoAtual=Number(m.saldoAtual||0);
  var qtdCompras=Number(m.qtdCompras||0);
  var qtdPagamentos=Number(m.qtdPagamentos||0);
  var ticketMedio=qtdCompras?totalComprado/qtdCompras:0;
  var taxa=totalComprado>0?Math.min(totalPago/totalComprado,1.2):0;
  var dias=0;
  if(qtdCompras>0){
    var base=qtdPagamentos>0 ? m.ultimoPagamento : m.primeiroCredito;
    dias=base ? Math.floor((cache.hoje-base)/(1000*60*60*24)) : 0;
  }

  var ptsPontualidade=0;
  if(totalComprado<=0) ptsPontualidade=18;
  else if(saldoAtual<=0.01) ptsPontualidade=40;
  else if(dias<=5) ptsPontualidade=34;
  else if(dias<=15) ptsPontualidade=25;
  else if(dias<=30) ptsPontualidade=14;
  else ptsPontualidade=3;

  var ptsCapacidade=0;
  if(totalComprado<=0) ptsCapacidade=8;
  else if(taxa>=0.90) ptsCapacidade=25;
  else if(taxa>=0.70) ptsCapacidade=18;
  else if(taxa>=0.50) ptsCapacidade=10;
  else if(taxa>=0.30) ptsCapacidade=5;
  else ptsCapacidade=0;

  var ptsVolume=0;
  if(totalComprado>=1500) ptsVolume=15;
  else if(totalComprado>=800) ptsVolume=12;
  else if(totalComprado>=400) ptsVolume=8;
  else if(totalComprado>=150) ptsVolume=5;
  else if(totalComprado>0) ptsVolume=2;

  var ptsTicket=0;
  if(ticketMedio>=300) ptsTicket=10;
  else if(ticketMedio>=200) ptsTicket=8;
  else if(ticketMedio>=120) ptsTicket=6;
  else if(ticketMedio>=60) ptsTicket=3;
  else if(ticketMedio>0) ptsTicket=1;

  var ptsHistorico=Math.min(5, Math.floor((qtdCompras+qtdPagamentos)/2));
  var ptsSituacao=0;
  if(saldoAtual<=0.01) ptsSituacao=5;
  else if(atual>0 && saldoAtual<=atual) ptsSituacao=3;
  else if(atual<=0 && saldoAtual>0) ptsSituacao=1;
  else ptsSituacao=0;

  var score=ptsPontualidade+ptsCapacidade+ptsVolume+ptsTicket+ptsHistorico+ptsSituacao;
  if(totalComprado>0 && taxa<0.30 && saldoAtual>0.01) score=Math.min(score,35);
  if(saldoAtual>0.01 && dias>45) score=Math.min(score,25);
  score=Math.max(0, Math.min(100, Math.round(score)));

  var multiplicador=0;
  if(totalComprado<=0) multiplicador=0;
  else if(score>=90) multiplicador=4;
  else if(score>=70) multiplicador=3;
  else if(score>=50) multiplicador=2;
  else if(score>=30) multiplicador=1;
  else multiplicador=0;

  var sugerido=arredLimite50_((ticketMedio||0)*multiplicador);
  if(score>=50 && saldoAtual>0) sugerido=Math.max(sugerido, arredLimite50_(saldoAtual));
  sugerido=Math.min(sugerido, 1200);
  if(totalComprado<=0) sugerido=atual;

  var acao='manter';
  if(score<30 && atual>0) acao='bloquear';
  else if(sugerido>atual+25) acao='aumentar';
  else if(sugerido<atual-25) acao='reduzir';

  return {cliente:cli,atual:atual,sugerido:sugerido,score:score,taxa:taxa,totalComprado:totalComprado,totalPago:totalPago,saldoAtual:saldoAtual,ticketMedio:ticketMedio,dias:dias,qtdCompras:qtdCompras,acao:acao};
}

function limiteHintClienteHTML(c, cache){
  try{
    var r=cache ? calcularSugestaoLimiteClienteCacheBM(c, cache) : calcularSugestaoLimiteCliente(c);
    if(!r || r.acao==='manter') return '';
    var simbolo=r.acao==='aumentar'?'↑':(r.acao==='reduzir'?'↓':'⛔');
    var cor=r.acao==='aumentar'?'var(--green)':(r.acao==='reduzir'?'var(--orange)':'var(--red2)');
    return '<br><span class="tm" style="color:'+cor+';font-weight:900;">'+simbolo+' Sug.: '+R(r.sugerido||0)+'</span>';
  }catch(e){return '';}
}


// CLIENTES — versão otimizada para não travar ao digitar
var _timerRenderClis=null;
function renderClisDebounced(){
  clearTimeout(_timerRenderClis);
  _timerRenderClis=setTimeout(renderClis, 180);
}
function montarMapaSaldoClientes(){
  var mapa={};
  (creditosValidos()||[]).forEach(function(f){
    var id=String(f.cid||'');
    if(!id) return;
    if(!mapa[id]) mapa[id]={tf:0,tp:0,sd:0};
    mapa[id].tf += Number(f.val||0);
  });
  (pagamentosValidos()||[]).forEach(function(p){
    var id=String(p.cid||'');
    if(!id) return;
    if(!mapa[id]) mapa[id]={tf:0,tp:0,sd:0};
    mapa[id].tp += Number(p.val||0);
  });
  Object.keys(mapa).forEach(function(id){ mapa[id].sd=Math.max(0, mapa[id].tf-mapa[id].tp); });
  return mapa;
}
function textoBuscaClienteBM(c){
  return String([c&&c.nome,c&&c.cpf,c&&c.tel,c&&c.end,c&&c.obs].join(' ')).toLowerCase();
}
function renderClis(){
  var inp=document.getElementById('c-sc');
  var q=(inp?inp.value:'').trim().toLowerCase();
  var todos=DB.get('clientes')||[];
  var limite=q ? 120 : 180;
  var filtrados=[];
  for(var i=0;i<todos.length;i++){
    var c=todos[i]||{};
    if(!q || textoBuscaClienteBM(c).includes(q)){
      filtrados.push(c);
      if(filtrados.length>=limite) break;
    }
  }
  var mapaSaldo=montarMapaSaldoClientes();
  var cacheLimite=montarCacheLimiteClientesBM(mapaSaldo);
  var rows=filtrados.map(function(c){
    var sd=(mapaSaldo[String(c.id||'')]||{sd:0}).sd;
    var cid=c.id;
    var lim=limiteClienteValor(c);
    return '<tr>'+
      '<td><b>'+c.nome+'</b>'+(c.obs?'<br><span class="tm">'+c.obs+'</span>':'')+'</td>'+
      '<td>'+(c.cpf||'—')+'</td>'+
      '<td>'+(c.tel||'—')+'</td>'+
      '<td style="font-size:13px;">'+(c.end||'—')+'</td>'+
      '<td><b style="color:'+(lim>0.01?'var(--gold)':'var(--txt2)')+'">'+(lim>0.01?R(lim):'—')+'</b>'+limiteHintClienteHTML(c, cacheLimite)+'</td>'+
      '<td><b style="color:'+(sd>0.01?'var(--red2)':'var(--green)')+'">'+R(sd)+'</b></td>'+
      '<td><span style="display:flex;gap:5px;flex-wrap:wrap;">'+
        '<button class="btn br xs" onclick="irCliVenda(\''+cid+'\')" title="Nova Venda" style="padding:5px 9px;font-size:12px;">🛒 Venda</button>'+
        '<button class="btn bb xs" onclick="irCliReceb(\''+cid+'\')" title="Recebimento" style="padding:5px 9px;font-size:12px;">💰 Receber</button>'+
        '<button class="btn bh xs" onclick="abrirMdCli(\''+cid+'\',\'clientes\')" style="padding:5px 8px;">✏️</button>'+
        '<button class="btn bd2 xs" onclick="delCli(\''+cid+'\')" style="padding:5px 8px;">🗑️</button>'+
      '</span></td></tr>';
  }).join('');
  var tb=document.getElementById('c-tb');
  if(tb) tb.innerHTML=rows || '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--txt2);">Nenhum cliente encontrado</td></tr>';
  var st=document.getElementById('c-status');
  if(st){
    var totalMatch = q ? todos.filter(function(c){return textoBuscaClienteBM(c||{}).includes(q);}).length : todos.length;
    st.textContent = totalMatch>limite ? 'Mostrando '+limite+' de '+totalMatch+' resultados. Continue digitando para filtrar.' : totalMatch+' resultado(s)';
  }
}

function irCliVenda(cid){
  var c=DB.get('clientes').find(function(x){return x.id===cid;});
  if(!c)return;
  ir('venda');
  setTimeout(function(){selecionarVCli(c.id);},150);
}
function irCliReceb(cid){
  ir('receb');
  setTimeout(function(){selecionarRCli(cid);},150);
}
var _cliCtx='';
function abrirMdCli(id,ctx){
  _cliCtx=ctx;
  document.getElementById('mo-cli-t').textContent=id?'Editar Cliente':'Novo Cliente';
  document.getElementById('cli-id').value=id||'';
  if(id){var c=DB.get('clientes').find(function(x){return x.id===id;});
    document.getElementById('cli-nome').value=c.nome||'';document.getElementById('cli-cpf').value=c.cpf||'';
    document.getElementById('cli-tel').value=c.tel||'';document.getElementById('cli-limite').value=fmtLimiteInput(c.limite_credito!=null?c.limite_credito:c.limite);document.getElementById('cli-end').value=c.end||'';document.getElementById('cli-obs').value=c.obs||'';
  }else{['cli-nome','cli-cpf','cli-tel','cli-limite','cli-end','cli-obs'].forEach(function(i){document.getElementById(i).value='';});}
  abrirMd('mo-cli');
}
function salvarCli(){
  var nome=document.getElementById('cli-nome').value.trim();
  if(!nome){toast('⚠️ Nome obrigatório!');return;}
  var id=document.getElementById('cli-id').value||DB.uid();
  var list=DB.get('clientes');
  var obj={id:id,nome:nome,cpf:document.getElementById('cli-cpf').value,tel:document.getElementById('cli-tel').value,limite_credito:dinheiroNum(document.getElementById('cli-limite').value),end:document.getElementById('cli-end').value,obs:document.getElementById('cli-obs').value};
  var idx=list.findIndex(function(c){return c.id===id;});
  if(idx>=0)list[idx]=obj;else list.push(obj);
  DB.set('clientes',list);fMd('mo-cli');
  if(_cliCtx==='clientes')renderClis();
  if(_cliCtx==='venda')selecionarVCli(obj);
  toast('✅ Cliente salvo!','ok');
}
function delCli(id){
  pedirSenha(function(){
    var clis=DB.get('clientes');
    var cli=clis.find(function(c){return c.id===id;});
    if(!cli){toast('⚠️ Cliente não encontrado!');return;}
    if(!confirm('Excluir cliente "'+(cli.nome||'Sem nome')+'"?\nEssa ação não pode ser desfeita!'))return;
    registrarDeletedStore('clientes', cli);
    DB.set('clientes', clis.filter(function(c){return c.id!==id;}));
    renderClis();
    toast('🗑️ Cliente excluído com segurança!','ok');
  });
}


function numBM(v){
  if(v==null || v==='') return 0;
  if(typeof v==='number') return Number.isFinite(v)?v:0;
  var s=String(v).trim()
    .replace(/R\$/gi,'')
    .replace(/\s/g,'')
    .replace(/\./g,'')
    .replace(',', '.');
  var n=Number(s);
  return Number.isFinite(n)?n:0;
}
function estoqueProdBM(p){
  if(!p) return 0;
  var estq = numBM(p.estq);
  var estoque = numBM(p.estoque);

  // No index, o campo editável principal é estq.
  // Alguns produtos ficaram com estoque=0 e estq correto; por isso estq vira prioridade.
  if(p.estq!=null && p.estq!=='' && estq!==estoque) return estq;
  if(p.estoque!=null && p.estoque!=='') return estoque;
  return estq;
}

function normalizarEstoqueProdutoBM(p){
  var e = estoqueProdBM(p);
  p.estq = e;
  p.estoque = e;
  return p;
}

function normalizarEstoquesProdutosBM(){
  var lista = DB.get('produtos') || [];
  var mudou = false;
  lista.forEach(function(p){
    var antesEstq = String(p.estq == null ? '' : p.estq);
    var antesEstoque = String(p.estoque == null ? '' : p.estoque);
    normalizarEstoqueProdutoBM(p);
    if(String(p.estq) !== antesEstq || String(p.estoque) !== antesEstoque) mudou = true;
  });
  if(mudou) DB.set('produtos', lista);
}
function textoBuscaProdBM(p){
  return [
    p && p.nome,
    p && p.cod,
    p && p.codigo,
    p && p.ean,
    p && p.codigos_barras,
    p && p.codigosBarras,
    p && p.desc2,
    p && p.cat,
    p && p.grupo,
    p && p.subcat,
    p && p.subcategoria
  ].map(function(v){return String(v||'').toLowerCase();}).join(' ');
}

function produtoArquivadoBM(p){
  return !!(p && (p.arquivado || p.unificadoEm || p.unificadoPara || p.inativo));
}
function produtosAtivosBM(lista){
  return (lista || []).filter(function(p){ return !produtoArquivadoBM(p); });
}
function produtoNomeCurtoBM(p){
  if(!p) return '';
  return (p.cod || p.codigo || '') + ' — ' + (p.nome || '') + ' — ' + R(numBM(p.preco)) + ' — Estq: ' + estoqueProdBM(p);
}
function buscarProdutosAtivosPorTextoBM(q, ignorarId, limite){
  q = String(q || '').trim().toLowerCase();
  limite = limite || 12;
  return produtosAtivosBM(DB.get('produtos') || []).filter(function(p){
    if(ignorarId && String(p.id) === String(ignorarId)) return false;
    return !q || textoBuscaProdBM(p).indexOf(q) >= 0;
  }).slice(0, limite);
}
function escolherProdutoExistentePromptBM(titulo, ignorarId){
  var busca = prompt((titulo || 'Buscar produto existente') + '\n\nDigite parte do nome, referência ou código de barras:');
  if(busca === null) return null;
  var lista = buscarProdutosAtivosPorTextoBM(busca, ignorarId, 9);
  if(!lista.length){ toast('⚠️ Nenhum produto encontrado.','warn'); return null; }
  var msg = 'Escolha o número do produto:\n\n' + lista.map(function(p, i){
    return (i + 1) + ') ' + produtoNomeCurtoBM(p);
  }).join('\n');
  var esc = prompt(msg);
  if(esc === null) return null;
  var n = parseInt(esc, 10);
  if(!n || !lista[n-1]){ toast('⚠️ Opção inválida.','warn'); return null; }
  return lista[n-1];
}

// PRODUTOS — versão otimizada para busca rápida
var _timerRenderProds=null;
var _estoquesNormalizadosUmaVez=false;
function renderProdsDebounced(){
  clearTimeout(_timerRenderProds);
  _timerRenderProds=setTimeout(renderProds, 180);
}
function renderProds(){
  if(!_estoquesNormalizadosUmaVez){
    normalizarEstoquesProdutosBM();
    _estoquesNormalizadosUmaVez=true;
  }
  var inp=document.getElementById('p-sc');
  var q=(inp?inp.value:'').trim().toLowerCase();
  var todos=produtosAtivosBM(DB.get('produtos')||[]);
  var limite=q ? 150 : 220;
  var prods=[];
  for(var i=0;i<todos.length;i++){
    var p=todos[i]||{};
    if(!q || textoBuscaProdBM(p).includes(q)){
      prods.push(p);
      if(prods.length>=limite) break;
    }
  }
  var rows=prods.map(function(p){
    var est=estoqueProdBM(p);
    return '<tr><td><b style="color:var(--gold);">'+(p.cod||p.codigo||'')+'</b></td>'+
      '<td><b>'+(p.nome||'')+'</b>'+(p.desc2?'<br><span class="tm">'+p.desc2+'</span>':'')+'</td>'+
      '<td><b>'+(p.grupo||categoriaPrincipalPorSubcategoria(p.subcategoria||p.subcat||p.cat||''))+'</b><br><span class="tm">'+(p.subcategoria||p.subcat||p.cat||'—')+'</span></td>'+
      '<td class="txt-go">'+R(numBM(p.preco))+'</td>'+
      '<td>'+est+'</td>'+
      '<td><span style="display:flex;gap:4px;">'+
        '<button class="btn bb xs" onclick="abrirModalEtiquetas(\''+p.id+'\')">🏷️</button>'+
        '<button class="btn bh xs" onclick="abrirMdProd(\''+p.id+'\')">✏️</button>'+
        '<button class="btn bo xs" title="Unificar produto" onclick="abrirUnificarProdutoBM(\''+p.id+'\')">🔗</button>'+
        '<button class="btn bd2 xs" onclick="delProd(\''+p.id+'\')">🗑️</button>'+
      '</span></td></tr>';
  }).join('');
  var tb=document.getElementById('p-tb');
  if(tb) tb.innerHTML=rows||'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--txt2);">Nenhum produto encontrado</td></tr>';
  var st=document.getElementById('p-status');
  if(st){
    var totalMatch = q ? todos.filter(function(p){return textoBuscaProdBM(p||{}).includes(q);}).length : todos.length;
    st.textContent = totalMatch>limite ? 'Mostrando '+limite+' de '+totalMatch+' resultados. Continue digitando para filtrar.' : totalMatch+' resultado(s)';
  }
}
function abrirMdProd(id){
  preencherCategoriasProduto('ROUPAS', 'Vestido');
  var catElCtrl = document.getElementById('prod-cat');
  if(catElCtrl){
    catElCtrl.dataset.manualCategory = id ? '1' : '';
    catElCtrl.dataset.autoCategory = '';
  }
  document.getElementById('mo-prod-t').textContent=id?'Editar Produto':'Novo Produto';
  document.getElementById('prod-id').value=id||'';
  if(id){var p=DB.get('produtos').find(function(x){return x.id===id;});
    document.getElementById('prod-cod').value=p.cod||'';document.getElementById('prod-nome').value=p.nome||'';
    var subcatSalva=p.subcategoria||p.subcat||p.cat||'Vestido';
    var grupoSalvo=p.grupo||categoriaPrincipalPorSubcategoria(subcatSalva);
    preencherCategoriasProduto(grupoSalvo, subcatSalva);
    document.getElementById('prod-preco').value=p.preco||'';
    document.getElementById('prod-estq').value=estoqueProdBM(p);document.getElementById('prod-desc2').value=p.desc2||'';
    document.getElementById('prod-custo').value=p.custo!=null?p.custo:'';
    document.getElementById('prod-ean').value=(p.ean||'');
    document.getElementById('prod-ncm').value=p.ncm||'';
    document.getElementById('prod-ncm').dataset.ncmOrigem=p.ncm_origem||p.origem_ncm||p.origem_fiscal||'';
    if(document.getElementById('prod-cest')) document.getElementById('prod-cest').value=p.cest||'';
    document.getElementById('prod-origem').value=p.origem||'0';
    document.getElementById('prod-unidade').value=p.unidade||(categoriaEhCalcado(p.subcategoria||p.subcat||p.cat||'')?'PAR':'UN');
    document.getElementById('prod-csosn').value=p.csosn||'102';
    document.getElementById('prod-cfop').value=p.cfop||'5102';
    if(document.getElementById('prod-cst-pis')) document.getElementById('prod-cst-pis').value=p.cst_pis||p.cstPis||'49';
    if(document.getElementById('prod-aliq-pis')) document.getElementById('prod-aliq-pis').value=p.aliq_pis!=null?p.aliq_pis:(p.aliqPis!=null?p.aliqPis:'0');
    if(document.getElementById('prod-cst-cofins')) document.getElementById('prod-cst-cofins').value=p.cst_cofins||p.cstCofins||'49';
    if(document.getElementById('prod-aliq-cofins')) document.getElementById('prod-aliq-cofins').value=p.aliq_cofins!=null?p.aliq_cofins:(p.aliqCofins!=null?p.aliqCofins:'0');
    document.getElementById('prod-escala').value=p.escala||'S';
    document.getElementById('prod-origem-estoque').value=p.origem_estoque||'manual_sem_xml';
  }else{
    ['prod-cod','prod-nome','prod-preco','prod-desc2','prod-custo','prod-ean','prod-ncm','prod-cest'].forEach(function(i){var el=document.getElementById(i); if(el) el.value='';});
    document.getElementById('prod-estq').value=0;
    preencherCategoriasProduto('ROUPAS', 'Vestido');
    document.getElementById('prod-origem').value='0';
    document.getElementById('prod-unidade').value='UN';
    document.getElementById('prod-csosn').value='102';
    document.getElementById('prod-cfop').value='5102';
    if(document.getElementById('prod-cst-pis')) document.getElementById('prod-cst-pis').value='49';
    if(document.getElementById('prod-aliq-pis')) document.getElementById('prod-aliq-pis').value='0';
    if(document.getElementById('prod-cst-cofins')) document.getElementById('prod-cst-cofins').value='49';
    if(document.getElementById('prod-aliq-cofins')) document.getElementById('prod-aliq-cofins').value='0';
    document.getElementById('prod-escala').value='S';
    document.getElementById('prod-origem-estoque').value='manual_sem_xml';
    if(document.getElementById('prod-ncm')) document.getElementById('prod-ncm').dataset.ncmOrigem='automatico';
    aplicarPadraoFiscal();
  }
  abrirMd('mo-prod');
}
function calcEAN13CheckDigit(base12){
  var nums=String(base12||'').replace(/\D/g,'').slice(0,12).split('').map(function(n){return parseInt(n,10)||0;});
  while(nums.length<12) nums.unshift(0);
  var sum=0;
  for(var i=0;i<12;i++) sum += nums[i] * (i%2===0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}
function gerarEANInternoUnico(produtos, ignorarId){
  var usados=new Set((produtos||[])
    .filter(function(p){ return !ignorarId || String(p.id)!==String(ignorarId); })
    .map(function(p){ return String(p.ean||'').replace(/\D/g,''); })
    .filter(Boolean));
  var prefixo='7899900';
  var maior=0;
  usados.forEach(function(ean){
    if(ean.length===13 && ean.indexOf(prefixo)===0){
      var seq=parseInt(ean.slice(prefixo.length, 12),10);
      if(!isNaN(seq) && seq>maior) maior=seq;
    }
  });
  for(var tentativa=maior+1; tentativa<99999; tentativa++){
    var base12=prefixo + String(tentativa).padStart(12-prefixo.length,'0');
    var ean=base12 + calcEAN13CheckDigit(base12);
    if(!usados.has(ean)) return ean;
  }
  return '';
}

function normalizarCodigoBarra(valor){
  return String(valor==null?'':valor).replace(/\s+/g,'').trim();
}
function extrairCodigosBarras(valor){
  return String(valor==null?'':valor)
    .split(/[\n,;|]+/)
    .map(function(v){ return normalizarCodigoBarra(v); })
    .filter(Boolean)
    .filter(function(v, i, arr){ return arr.indexOf(v)===i; });
}
function obterEanPrincipalProduto(prod){
  var codigos=extrairCodigosBarras(prod && (prod.ean||prod.codigo_barras||prod.codBarras||prod.codigoDeBarras||''));
  return codigos[0] || '';
}
function codigoPertenceProduto(prod, valor){
  var alvo=normalizarCodigoBarra(valor);
  if(!alvo) return false;
  var codigos=extrairCodigosBarras(prod && (prod.ean||prod.codigo_barras||prod.codBarras||prod.codigoDeBarras||''));
  return codigos.indexOf(alvo)>=0;
}
function buscarProdutoPorCodigoOuCodigoBarras(valor){
  var alvo=normalizarCodigoBarra(valor);
  return produtosAtivosBM(DB.get('produtos')||[]).find(function(p){
    return codigoPertenceProduto(p, alvo) || normalizarCodigoBarra(p && (p.cod||p.codigo||''))===alvo;
  }) || null;
}

function gerarReferenciaAutomatica(produtos, categoria, ignorarId){
  var prefixo = REF_POR_CATEGORIA[categoria] || 'PRO';
  var usados = new Set((produtos||[])
    .filter(function(p){ return !ignorarId || String(p.id)!==String(ignorarId); })
    .map(function(p){ return String(p.cod||'').trim().toUpperCase(); })
    .filter(Boolean));
  for(var numero=1; numero<10000; numero++){
    var ref = prefixo + '-' + String(numero).padStart(4,'0');
    if(!usados.has(ref)) return ref;
  }
  return prefixo + '-' + String(Date.now()).slice(-4);
}
function salvarProd(){
  var cod=document.getElementById('prod-cod').value.trim();
  var nome=document.getElementById('prod-nome').value.trim();
  var preco=parseFloat(document.getElementById('prod-preco').value);
  if(!nome||!preco){toast('⚠️ Nome e preço são obrigatórios!');return;}
  var id=document.getElementById('prod-id').value||DB.uid();
  var list=DB.get('produtos');
  var atual=list.find(function(p){return p.id===id;})||{};
  var categoria=document.getElementById('prod-cat').value;
  var grupo=(document.getElementById('prod-grupo').value||categoriaPrincipalPorSubcategoria(categoria));
  var origemEstoque=document.getElementById('prod-origem-estoque').value;
  var codInformado=cod;
  var codFinal=codInformado || atual.cod || '';

  if(!codFinal){
    codFinal=gerarReferenciaAutomatica(list, categoria, id);
  }

  var duplicadoCod=list.find(function(p){
    return !produtoArquivadoBM(p) && String(p.id)!==String(id) && String(p.cod||'').trim().toUpperCase()===String(codFinal).trim().toUpperCase();
  });
  if(duplicadoCod){toast('⚠️ Já existe outro produto com esta referência!');return;}

  var eanInformado=document.getElementById('prod-ean').value.trim();
  var codigosDigitados=extrairCodigosBarras(eanInformado);
  var codigosAtuais=extrairCodigosBarras(atual.ean||'');
  var codigosFinais=codigosDigitados.length ? codigosDigitados : codigosAtuais;

  if(!codigosFinais.length && origemEstoque==='manual_sem_xml'){
    codigosFinais=[gerarEANInternoUnico(list, id)];
  }

  for(var ce=0; ce<codigosFinais.length; ce++){
    var codigoTeste=codigosFinais[ce];
    var duplicadoEAN=list.find(function(p){
      return !produtoArquivadoBM(p) && String(p.id)!==String(id) && codigoPertenceProduto(p, codigoTeste);
    });
    if(duplicadoEAN){toast('⚠️ Já existe outro produto com este código de barras!');return;}
  }

  var eanFinal=codigosFinais.join(',');

  var ncmValor=document.getElementById('prod-ncm').value.trim();
  var ncmCategoria=NCM_POR_CATEGORIA[categoria] || '';
  var ncmOrigem=resolverOrigemNcmProdutoApp(atual, ncmValor, ncmCategoria, origemEstoque);
  var origemFiscal=origemFiscalPorEstoqueApp(origemEstoque);

  var obj={
    id:id,
    cod:codFinal,
    nome:nome,
    cat:document.getElementById('prod-cat').value,
    subcat:document.getElementById('prod-cat').value,
    subcategoria:document.getElementById('prod-cat').value,
    grupo:grupo,
    preco:preco,
    estq:parseInt(document.getElementById('prod-estq').value)||0,
    estoque:parseInt(document.getElementById('prod-estq').value)||0,
    desc2:document.getElementById('prod-desc2').value,
    custo:parseFloat(document.getElementById('prod-custo').value)||0,
    ean:eanFinal,
    ncm:ncmValor,
    cest:(document.getElementById('prod-cest')?document.getElementById('prod-cest').value.trim():''),
    origem:document.getElementById('prod-origem').value,
    unidade:document.getElementById('prod-unidade').value,
    csosn:document.getElementById('prod-csosn').value.trim()||'102',
    cfop:document.getElementById('prod-cfop').value.trim()||'5102',
    cst_pis:(document.getElementById('prod-cst-pis')?document.getElementById('prod-cst-pis').value.trim():'49')||'49',
    aliq_pis:parseFloat((document.getElementById('prod-aliq-pis')||{}).value)||0,
    cst_cofins:(document.getElementById('prod-cst-cofins')?document.getElementById('prod-cst-cofins').value.trim():'49')||'49',
    aliq_cofins:parseFloat((document.getElementById('prod-aliq-cofins')||{}).value)||0,
    escala:document.getElementById('prod-escala').value,
    origem_estoque:origemEstoque,
    origem_fiscal:origemFiscal,
    origem_fiscal_status:classificarOrigemFiscalProdutoApp(Object.assign({}, atual, {origem_estoque:origemEstoque, origem_fiscal:origemFiscal})),
    ncm_origem:ncmOrigem,
    origem_ncm:ncmOrigem,
    createdAt:atual.createdAt||nowLocalISO(),
    updatedAt:nowLocalISO()
  };
  var idx=list.findIndex(function(p){return p.id===id;});
  if(idx>=0)list[idx]=Object.assign({}, atual, obj);else list.push(obj);
  DB.set('produtos',list);
  document.getElementById('prod-cod').value=codFinal;
  document.getElementById('prod-ean').value=eanFinal;
  fMd('mo-prod');renderProds();renderPGrid();
  var gerouRef = !codInformado && !!codFinal;
  var gerouEan = !eanInformado && origemEstoque==='manual_sem_xml' && !!extrairCodigosBarras(eanFinal).length;
  var msg = '✅ Produto salvo!';
  if(gerouRef && gerouEan) msg = '✅ Produto salvo com referência e código de barras automáticos!';
  else if(gerouRef) msg = '✅ Produto salvo com referência automática!';
  else if(gerouEan) msg = '✅ Produto salvo com código de barras interno!';
  toast(msg,'ok');
}
function delProd(id){
  id=String(id||'');
  if(!id){toast('⚠️ Produto inválido!');return;}

  var noCarrinho=(cart||[]).some(function(i){return String(i && i.pid || '')===id;});
  if(noCarrinho){
    toast('⚠️ Este produto está no carrinho. Remova do carrinho antes de excluir.','warn');
    return;
  }

  if(!confirm('Excluir produto?'))return;

  var prods=DB.get('produtos')||[];
  var novo=[];
  var removido=null;

  for(var i=0;i<prods.length;i++){
    var p=prods[i];
    if(String(p && p.id || '')===id){removido=p;continue;}
    novo.push(p);
  }

  if(!removido){toast('⚠️ Produto não encontrado ou já excluído.','warn');return;}

  try{
    localStorage.setItem('bm_backup_produtos_antes_exclusao', JSON.stringify({
      data: nowLocalISO(),
      produto: removido
    }));
  }catch(e){}

  // Exclusão direta: a planilha será substituída pela lista atual no próximo syncAll.
  // Não gravamos mais em bm_deleted_produtos para evitar travamento ao excluir muitos itens.
  DB.set('produtos',novo);

  setTimeout(function(){try{renderProds();}catch(e){}},20);
  setTimeout(function(){try{renderPGrid();}catch(e){}},80);
  toast('🗑️ Produto excluído. Sincronize para remover da planilha.','ok');
}


var etiquetasSelecao=[];
var etqBuscaLista=[];
var etqFormato='6x4';
var etqModoImpressao='a4';

function getProdutosFiltradosLista(){
  var q=((document.getElementById('p-sc')||{}).value||'').trim().toLowerCase();
  return (DB.get('produtos')||[]).filter(function(p){
    return !q || textoBuscaProdBM(p).includes(q);
  });
}

function getEtiquetaSearchResults(q){
  q=String(q||'').trim().toLowerCase();
  var lista=(DB.get('produtos')||[]).filter(function(p){
    if(!q) return true;
    return String(p.nome||'').toLowerCase().includes(q) ||
           String(p.cod||'').toLowerCase().includes(q) ||
           String(p.ean||'').toLowerCase().includes(q);
  });
  lista.sort(function(a,b){ return String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'); });
  return lista.slice(0,120);
}

function buscarEtiquetasPorNome(q){
  etqBuscaLista = getEtiquetaSearchResults(q);
  renderEtiquetaBusca();
}

function carregarEtiquetasDeProdutos(prods, limparAntes){
  if(limparAntes!==false) etiquetasSelecao=[];
  var mapa=new Map(etiquetasSelecao.map(function(i){ return [String(i.pid), i]; }));
  (prods||[]).forEach(function(p){
    if(!p || !p.id) return;
    if(!mapa.has(String(p.id))) mapa.set(String(p.id), {pid:String(p.id), qty:1});
  });
  etiquetasSelecao=Array.from(mapa.values());
  renderEtiquetaModal();
}

function abrirModalEtiquetas(pid){
  if(pid){
    var p=(DB.get('produtos')||[]).find(function(x){ return String(x.id)===String(pid); });
    etiquetasSelecao = p ? [{pid:String(p.id), qty:1}] : [];
  }else{
    etiquetasSelecao = [];
  }
  var busca=document.getElementById('etq-busca');
  if(busca) busca.value='';
  etqBuscaLista = getEtiquetaSearchResults('');
  renderEtiquetaBusca();
  renderEtiquetaModal();
  abrirMd('mo-etq');
  setTimeout(function(){ var b=document.getElementById('etq-busca'); if(b) b.focus(); }, 80);
}

function limparEtiquetas(){
  etiquetasSelecao=[];
  var busca=document.getElementById('etq-busca');
  if(busca) busca.value='';
  etqBuscaLista = getEtiquetaSearchResults('');
  renderEtiquetaBusca();
  renderEtiquetaModal();
}

function adicionarSelecionados(){
  var checks=document.querySelectorAll('#etq-busca-tb .etq-add-check:checked');
  if(!checks.length){ toast('⚠️ Selecione pelo menos um produto.'); return; }
  var mapa=new Map(etiquetasSelecao.map(function(i){ return [String(i.pid), {pid:String(i.pid), qty:Number(i.qty||0)}]; }));
  checks.forEach(function(ch){
    var tr=ch.closest('tr');
    if(!tr) return;
    var pid=String(tr.getAttribute('data-id')||'');
    var inp=tr.querySelector('.etq-add-qty');
    var qtd=Math.max(1, parseInt((inp&&inp.value)||1,10)||1);
    if(mapa.has(pid)){
      mapa.get(pid).qty += qtd;
    }else{
      mapa.set(pid, {pid:pid, qty:qtd});
    }
  });
  etiquetasSelecao=Array.from(mapa.values());
  renderEtiquetaModal();
  renderEtiquetaBusca();
}

function renderEtiquetaBusca(){
  var tb=document.getElementById('etq-busca-tb');
  if(!tb) return;
  var selecionados=new Set(etiquetasSelecao.map(function(i){ return String(i.pid); }));
  tb.innerHTML=(etqBuscaLista||[]).map(function(p){
    var ja=selecionados.has(String(p.id));
    return '<tr data-id="'+escaparHtml(String(p.id))+'">'+
      '<td><input type="checkbox" class="etq-add-check" '+(ja?'disabled':'')+'></td>'+
      '<td>'+escaparHtml(p.nome||'')+(ja?' <span class="tm">(já adicionado)</span>':'')+'</td>'+
      '<td>'+escaparHtml(p.cod||'')+'</td>'+
      '<td>'+R(Number(p.preco||0))+'</td>'+
      '<td><input class="fi etq-add-qty" type="number" min="1" step="1" value="1" style="width:80px;" '+(ja?'disabled':'')+'></td>'+
    '</tr>';
  }).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--txt2);">Nenhum produto encontrado</td></tr>';
}

function removerEtiquetaItem(pid){
  etiquetasSelecao = etiquetasSelecao.filter(function(i){ return String(i.pid)!==String(pid); });
  renderEtiquetaModal();
}

function atualizarQtdEtiqueta(pid, val){
  var n=parseInt(val,10);
  if(!isFinite(n) || n<0) n=0;
  etiquetasSelecao = etiquetasSelecao.map(function(i){
    return String(i.pid)===String(pid) ? {pid:i.pid, qty:n} : i;
  });
  renderEtiquetaModal();
}

function escaparHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]; });
}

function alterarFormatoEtiqueta(v){
  etqFormato = String(v||'6x4');
  renderEtiquetaModal();
}

function alterarModoEtiqueta(v){
  etqModoImpressao = String(v||'a4');
}

function getEtiquetaFormatoCfg(fmt){
  fmt = String(fmt||etqFormato||'6x4');
  if(fmt==='6x2'){
    return {
      cls:'size-6x2',
      barcodeWidth13:0.72,
      barcodeWidth128:0.66,
      barcodeHeight:16
    };
  }
  return {
    cls:'size-6x4',
    barcodeWidth13:0.9,
    barcodeWidth128:0.8,
    barcodeHeight:26
  };
}

function etiquetaCardHTML(p, idx, formato){
  var cfg = getEtiquetaFormatoCfg(formato);
  var preco = 'R$ ' + Number(p.preco||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
  var ref = p.cod || '';
  var code = String(obterEanPrincipalProduto(p)||p.cod||'').replace(/\s+/g,'');
  return '<div class="etq-card '+cfg.cls+'">'+
    '<div class="etq-brand">Bela Modas</div>'+
    '<div class="etq-line"></div>'+
    '<div class="etq-name">'+escaparHtml(p.nome||'')+(ref?' Ref '+escaparHtml(ref):'')+'</div>'+
    '<div class="etq-ref">Ref: '+escaparHtml(ref)+'</div>'+
    '<div class="etq-price">'+escaparHtml(preco)+'</div>'+
    '<div class="etq-barcode-wrap">'+
      '<svg class="etq-barcode" id="etq-bar-'+idx+'" data-formatocfg="'+cfg.cls+'" data-code="'+escaparHtml(code)+'"></svg>'+
      '<div class="etq-code">'+escaparHtml(code)+'</div>'+
    '</div>'+
  '</div>';
}

function renderBarcodeSvgs(root){
  if(typeof JsBarcode==='undefined') return;
  (root||document).querySelectorAll('.etq-barcode').forEach(function(svg){
    var code=String(svg.getAttribute('data-code')||'').replace(/\D/g,'');
    if(!code) code='000000000000';
    var cls = String(svg.getAttribute('data-formatocfg')||'size-6x4');
    var cfg = cls.indexOf('6x2')>=0 ? {w13:0.72,w128:0.66,h:16} : {w13:0.9,w128:0.8,h:26};
    try{
      if(code.length===13){
        JsBarcode(svg, code, {format:'EAN13', displayValue:false, margin:0, width:1.25, height:24});
      }else{
        JsBarcode(svg, code, {format:'CODE128', displayValue:false, margin:0, width:1.25, height:24});
      }
    }catch(e){
      try{ JsBarcode(svg, code, {format:'CODE128', displayValue:false, margin:0, width:1.25, height:24}); }catch(_e){}
    }
  });
}

function renderEtiquetaModal(){
  var tb=document.getElementById('etq-tb');
  var pv=document.getElementById('etq-preview');
  if(!tb || !pv) return;
  var prods=DB.get('produtos')||[];
  var itens=etiquetasSelecao.map(function(i){
    var p=prods.find(function(x){ return String(x.id)===String(i.pid); });
    return p ? {prod:p, qty:Number(i.qty||0)} : null;
  }).filter(Boolean);
  tb.innerHTML = itens.map(function(it){
    var p=it.prod;
    return '<tr>'+
      '<td>'+escaparHtml(p.nome||'')+'</td>'+
      '<td>'+escaparHtml(p.cod||'')+'</td>'+
      '<td>'+R(Number(p.preco||0))+'</td>'+
      '<td><input class="fi" type="number" min="0" step="1" value="'+it.qty+'" style="width:90px;" oninput="atualizarQtdEtiqueta(\''+p.id+'\', this.value)"></td>'+
      '<td><button class="btn bd2 xs" onclick="removerEtiquetaItem(\''+p.id+'\')">✕</button></td>'+
    '</tr>';
  }).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--txt2);">Nenhum produto selecionado</td></tr>';

  var formatoSel = document.getElementById('etq-formato');
  if(formatoSel) formatoSel.value = etqFormato;
  var modoSel = document.getElementById('etq-modo');
  if(modoSel) modoSel.value = etqModoImpressao;

  var primeiro = itens.find(function(it){ return it.qty>0; });
  pv.innerHTML = primeiro ? etiquetaCardHTML(primeiro.prod, 0, etqFormato) : '<div class="tm">Selecione pelo menos um produto para visualizar a etiqueta.</div>';
  renderBarcodeSvgs(pv);
}

function imprimirEtiquetasA4(){
  var prods=DB.get('produtos')||[];
  var lista=[];
  etiquetasSelecao.forEach(function(it){
    var p=prods.find(function(x){ return String(x.id)===String(it.pid); });
    var qtd=Math.max(0, parseInt(it.qty,10)||0);
    if(!p || !qtd) return;
    for(var i=0;i<qtd;i++) lista.push(p);
  });
  if(!lista.length){ toast('⚠️ Selecione pelo menos uma etiqueta para imprimir.'); return; }
  var host=document.getElementById('print-etiquetas');
  if(etqModoImpressao==='termica'){
    host.innerHTML='<div class="termica-list">'+lista.map(function(p, idx){ return etiquetaCardHTML(p, idx, etqFormato); }).join('')+'</div>';
  }else{
    host.innerHTML='<div class="a4-grid size-'+etqFormato+'">'+lista.map(function(p, idx){ return etiquetaCardHTML(p, idx, etqFormato); }).join('')+'</div>';
  }
  renderBarcodeSvgs(host);
  setTimeout(function(){ window.print(); }, 120);
}

// VENDA
var cart=[],vCli=null,vForma='dinheiro',vDesconto=0,vPagamentosDivididos=null;
function getCartSubtotal(){ return cart.reduce(function(s,i){return s+(Number(i.preco||0)*Number(i.qty||0));},0); }
function getCartDiscount(){
  var sub=getCartSubtotal();
  var d=Number(vDesconto||0);
  if(!isFinite(d) || d<0) d=0;
  if(d>sub) d=sub;
  vDesconto=d;
  return d;
}
function getCartTotal(){ return Math.max(0, getCartSubtotal() - getCartDiscount()); }
function aplicarDescontoVenda(v){
  var n=parseFloat(String(v||'').replace(',','.'));
  if(!isFinite(n) || n<0) n=0;
  vDesconto=n;
  renderCart();
}
function initVenda(){
  cart=[];vCli=null;vForma='dinheiro';vDesconto=0;vPagamentosDivididos=null;
  var vsc=document.getElementById('v-sc'); if(vsc) vsc.value='';
  var vsg=document.getElementById('v-sg'); if(vsg) vsg.innerHTML='';// v-cs removido
  var vdesc=document.getElementById('v-desc'); if(vdesc) vdesc.value='';
  var vpreco=document.getElementById('v-preco'); if(vpreco) vpreco.value='';
  var vqty=document.getElementById('v-qty'); if(vqty) vqty.value='1';
  var cdesc=document.getElementById('cdesc'); if(cdesc) cdesc.value='';
  var bfs=document.querySelectorAll('.bf');
  if(bfs && bfs.length){
    bfs.forEach(function(b){b.classList.remove('on');});
    if(bfs[0]) bfs[0].classList.add('on');
  }
  renderCart();renderPGrid();
}
function selVTab(btn,tab){
  document.querySelectorAll('.vtab').forEach(function(t){t.classList.remove('on');});
  document.querySelectorAll('.vtab-panel').forEach(function(p){p.classList.remove('on');});
  btn.classList.add('on');document.getElementById('vtp-'+tab).classList.add('on');
  if(tab==='catalogo')renderPGrid();
}
function renderPGrid(){
  if(!_estoquesNormalizadosUmaVez){
    normalizarEstoquesProdutosBM();
    _estoquesNormalizadosUmaVez=true;
  }
  var el=document.getElementById('pgrid');if(!el)return;
  var q=(document.getElementById('v-psrch')?document.getElementById('v-psrch').value||'':'').trim().toLowerCase();
  var todos=produtosAtivosBM(DB.get('produtos')||[]);
  var limite=q ? 160 : 240;
  var prods=[];
  for(var i=0;i<todos.length;i++){
    var p=todos[i]||{};
    if(!q || textoBuscaProdBM(p).includes(q)){
      prods.push(p);
      if(prods.length>=limite) break;
    }
  }
  var catIco={Vestidos:'👗',Blusas:'👚',Calças:'👖',Saias:'👘',Acessórios:'💍',Calçados:'👠',Lingerie:'🩱',Outros:'🛍️'};
  el.innerHTML=prods.map(function(p){
    var est=estoqueProdBM(p);
    return '<div class="pcard" onclick="addProd(\''+p.id+'\')">'+
      '<div style="font-size:22px;">'+(catIco[p.cat]||'🛍️')+'</div>'+
      '<div class="pcard-c">'+(p.cod||p.codigo||'')+'</div>'+
      '<div class="pcard-n">'+(p.nome||'')+'</div>'+
      '<div class="pcard-p">'+R(numBM(p.preco))+'</div>'+
      '<div class="pcard-c">Estoque: '+est+'</div>'+
    '</div>';
  }).join('')||'<div style="color:var(--txt2);padding:16px;font-size:13px;">Nenhum produto cadastrado</div>';
}
function addProd(pid){
  var p=(DB.get('produtos')||[]).find(function(x){return x.id===pid;});
  if(!p || produtoArquivadoBM(p)){ toast('⚠️ Produto arquivado/unificado não pode ser vendido.','warn'); return; }
  var ex=cart.find(function(i){return String(i.pid||'')===String(pid);});
  if(ex){
    ex.qty++;
    if(!ex.cod) ex.cod = p.cod || p.codigo || '';
    if(!ex.ean) ex.ean = obterEanPrincipalProduto(p);
    if(!ex.ncm) ex.ncm = p.ncm || '';
    if(!ex.cfop) ex.cfop = p.cfop || '5102';
    if(!ex.csosn) ex.csosn = p.csosn || '102';
    if(!ex.unidade) ex.unidade = p.unidade || 'UN';
    if(!ex.origem) ex.origem = p.origem || '0';
  }else{
    cart.push({
      id:DB.uid(),
      pid:pid,
      cod:p.cod||p.codigo||'',
      ean:obterEanPrincipalProduto(p),
      ncm:p.ncm||'',
      cfop:p.cfop||'5102',
      csosn:p.csosn||'102',
      unidade:p.unidade||'UN',
      origem:p.origem||'0',
      desc:p.nome,
      nome:p.nome,
      preco:numBM(p.preco),
      qty:1
    });
  }
  renderCart();toast(p.nome+' adicionado!','ok');
}
function posSugProdutoManual(){
  var inp=document.getElementById('v-desc');
  var sg=document.getElementById('v-desc-sg');
  if(!inp||!sg) return;
  var r=inp.getBoundingClientRect();
  sg.style.left = r.left + 'px';
  sg.style.top = (r.bottom + 4) + 'px';
  sg.style.width = r.width + 'px';
}
function limparBuscaProdutoManual(){
  var sg=document.getElementById('v-desc-sg');
  if(sg){sg.innerHTML='';sg.style.display='none';}
}
function selecionarProdutoManual(pid){
  var p=(DB.get('produtos')||[]).find(function(x){return String(x.id)===String(pid);});
  if(!p)return;
  document.getElementById('v-desc').value=p.nome||'';
  document.getElementById('v-preco').value=numBM(p.preco).toFixed(2);
  document.getElementById('v-qty').value='1';
  limparBuscaProdutoManual();
  document.getElementById('v-qty').focus();
}
function buscarProdutoManual(){
  normalizarEstoquesProdutosBM();
  var inp=document.getElementById('v-desc');
  var sg=document.getElementById('v-desc-sg');
  if(!inp||!sg)return;
  var q=(inp.value||'').trim().toLowerCase();
  if(!q){limparBuscaProdutoManual();return;}
  var res=(DB.get('produtos')||[]).filter(function(p){
    var nome=String(p.nome||'').toLowerCase();
    var cod=String(p.cod||'').toLowerCase();
    var barras=String(p.ean||'').toLowerCase();
    var barrasExtras=String(p.codigos_barras||p.codigosBarras||'').toLowerCase();
    return nome.includes(q)||cod.includes(q)||barras.includes(q)||barrasExtras.includes(q);
  }).slice(0,8);

  if(!res.length){limparBuscaProdutoManual();return;}

  sg.innerHTML=res.map(function(p){
    var estq=estoqueProdBM(p);
    var cls=estq<=0?'zero':(estq<=3?'low':'');
    return '<div class="v-sug-item" onclick="selecionarProdutoManual(\''+p.id+'\')">'+
      '<div class="v-sug-nome">'+(p.nome||'')+'</div>'+
      '<div class="v-sug-meta"><span>'+(p.cod||'')+'</span><span>'+R(numBM(p.preco))+'</span><span class="v-sug-estq '+cls+'">Estoque: '+estq+'</span></div>'+
    '</div>';
  }).join('');
  posSugProdutoManual();
  sg.style.display='block';
}
document.addEventListener('click',function(ev){
  var box=document.querySelector('.v-sug');
  var sg=document.getElementById('v-desc-sg');
  if(!box) return;
  if(!box.contains(ev.target) && !(sg && sg.contains(ev.target))) limparBuscaProdutoManual();
});
window.addEventListener('resize', posSugProdutoManual);
window.addEventListener('scroll', posSugProdutoManual, true);


/* ==============================
   MÓDULO: UNIFICAÇÃO DE PRODUTOS
   Mantém histórico: produto origem fica arquivado, não é apagado.
============================== */
function abrirUnificarProdutoBM(origemId){
  var produtos = DB.get('produtos') || [];
  var origem = produtos.find(function(p){ return String(p.id) === String(origemId); });
  if(!origem || produtoArquivadoBM(origem)){ toast('⚠️ Produto de origem inválido.','warn'); return; }
  var destino = escolherProdutoExistentePromptBM('Unificar em qual produto?', origemId);
  if(!destino) return;
  if(String(destino.id) === String(origem.id)){ toast('⚠️ Escolha um produto diferente.','warn'); return; }
  var subOrigem = origem.subcategoria || origem.subcat || origem.cat || '';
  var subDestino = destino.subcategoria || destino.subcat || destino.cat || '';
  var grupoOrigem = origem.grupo || categoriaPrincipalPorSubcategoria(subOrigem);
  var grupoDestino = destino.grupo || categoriaPrincipalPorSubcategoria(subDestino);
  if(grupoOrigem && grupoDestino && grupoOrigem !== grupoDestino){
    if(!confirm('Atenção: os produtos são de grupos diferentes.\n\nOrigem: '+grupoOrigem+'\nDestino: '+grupoDestino+'\n\nDeseja continuar mesmo assim?')) return;
  }
  if(Number(origem.preco||0) !== Number(destino.preco||0)){
    if(!confirm('Atenção: os preços são diferentes.\n\nOrigem: '+R(origem.preco)+'\nDestino: '+R(destino.preco)+'\n\nDeseja continuar?')) return;
  }
  var msg = 'Confirmar unificação?\n\nOrigem: '+produtoNomeCurtoBM(origem)+'\nDestino mantido: '+produtoNomeCurtoBM(destino)+'\n\nO estoque será somado e o produto origem ficará arquivado, não apagado.';
  if(!confirm(msg)) return;
  unificarProdutosBM(origem.id, destino.id);
}
function unificarProdutosBM(origemId, destinoId){
  var produtos = DB.get('produtos') || [];
  var io = produtos.findIndex(function(p){ return String(p.id) === String(origemId); });
  var id = produtos.findIndex(function(p){ return String(p.id) === String(destinoId); });
  if(io < 0 || id < 0 || io === id){ toast('⚠️ Não foi possível unificar.','warn'); return; }
  var origem = produtos[io];
  var destino = produtos[id];
  if(produtoArquivadoBM(origem) || produtoArquivadoBM(destino)){ toast('⚠️ Produto arquivado não pode ser unificado.','warn'); return; }
  var agora = nowLocalISO();
  destino.estq = estoqueProdBM(destino) + estoqueProdBM(origem);
  destino.estoque = destino.estq;
  if(!destino.custo && origem.custo) destino.custo = origem.custo;
  var eans = extrairCodigosBarras((destino.ean || '') + ',' + (origem.ean || ''));
  if(eans.length) destino.ean = eans.join(',');
  destino.unificacoes = Array.isArray(destino.unificacoes) ? destino.unificacoes : [];
  destino.unificacoes.push({origemId: origem.id, origemCod: origem.cod || origem.codigo || '', origemNome: origem.nome || '', estoqueSomado: estoqueProdBM(origem), data: agora});
  destino.updatedAt = agora;
  origem.arquivado = true;
  origem.unificadoPara = destino.id;
  origem.unificadoEm = agora;
  origem.estq = 0;
  origem.estoque = 0;
  origem.updatedAt = agora;
  produtos[id] = destino;
  produtos[io] = origem;
  DB.set('produtos', produtos);
  renderProds();
  if(typeof renderPGrid === 'function') renderPGrid();
  toast('✅ Produtos unificados com segurança!','ok');
}

/* ==============================
   MÓDULO: VINCULAR XML A PRODUTO EXISTENTE
============================== */
function vincularItemXMLProdutoExistenteBM(idx){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens[idx]) return;
  var it = importacaoXMLAtual.itens[idx];
  var destino = escolherProdutoExistentePromptBM('Adicionar item do XML a qual produto existente?', '');
  if(!destino) return;
  var msg = 'Adicionar '+Number(it.qtd||0)+' unidade(s) de:\n'+(it.nome||'Item XML')+'\n\nao produto:\n'+produtoNomeCurtoBM(destino)+'?';
  if(!confirm(msg)) return;
  it.vincularProdutoId = destino.id;
  it.existenteId = destino.id;
  it.acaoXML = 'adicionar_existente';
  if(!it.precoVenda) it.precoVenda = Number(destino.preco || 0);
  renderPreviewImportacaoXML();
  toast('✅ Item vinculado ao produto existente.','ok');
}
function criarNovoItemXMLBM(idx){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens[idx]) return;
  var it = importacaoXMLAtual.itens[idx];
  it.vincularProdutoId = '';
  it.existenteId = '';
  it.acaoXML = 'criar_novo';
  renderPreviewImportacaoXML();
  toast('ℹ️ Item marcado para criar novo produto.','info');
}
var importacaoXMLAtual=null;

function abrirImportaXML(){
  preencherCategoriasXML('CALÇADOS');
  abrirMd('mo-importa-xml');
}
function abrirImportaFoto(){
  abrirMd('mo-importa-foto');
}
function montarOptionsXML(lista, valor){
  return (lista || []).map(function(v){
    return '<option value="'+v+'" '+(String(v)===String(valor)?'selected':'')+'>'+v+'</option>';
  }).join('');
}
function preencherCategoriasXML(valor){
  var sel=document.getElementById('ix-cat-principal');
  if(!sel) return;
  var atual=valor || sel.value || 'CALÇADOS';
  sel.innerHTML=montarOptionsXML(CATEGORIAS_PRINCIPAIS, atual);
  sel.value=CATEGORIAS_PRINCIPAIS.indexOf(atual)>=0?atual:'CALÇADOS';
  preencherSubcatsXML(sel.value);
}
function preencherSubcatsXML(grupo, valor){
  var sel=document.getElementById('ix-subcategoria');
  if(!sel) return;
  var g=grupo || (document.getElementById('ix-cat-principal')||{}).value || 'CALÇADOS';
  var lista=SUBCATEGORIAS_POR_PRINCIPAL[g] || SUBCATEGORIAS_POR_PRINCIPAL.OUTROS || ['Outros'];
  var atual=valor || sel.value || lista[0] || 'Outros';
  sel.innerHTML=montarOptionsXML(lista, atual);
  sel.value=lista.indexOf(atual)>=0?atual:(lista[0]||'Outros');
}
function aplicarCategoriasXMLTodos(){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens) return;
  var grupo=(document.getElementById('ix-cat-principal')||{}).value || 'OUTROS';
  var sub=(document.getElementById('ix-subcategoria')||{}).value || 'Outros';
  importacaoXMLAtual.itens.forEach(function(it){
    it.grupo=grupo;
    it.cat=sub;
    it.subcat=sub;
    it.subcategoria=sub;
    if(!ncmValidoApp(it.ncm) && NCM_POR_CATEGORIA[sub]){ it.ncm=NCM_POR_CATEGORIA[sub]; it.ncm_origem='automatico'; }
  });
  renderPreviewImportacaoXML();
  toast('✅ Categoria aplicada para todos os itens!','ok');
}
function alterarCategoriaXML(idx, grupo){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens[idx]) return;
  var lista=SUBCATEGORIAS_POR_PRINCIPAL[grupo] || SUBCATEGORIAS_POR_PRINCIPAL.OUTROS || ['Outros'];
  var sub=lista[0] || 'Outros';
  var it=importacaoXMLAtual.itens[idx];
  it.grupo=grupo;
  it.cat=sub;
  it.subcat=sub;
  it.subcategoria=sub;
  if(!ncmValidoApp(it.ncm) && NCM_POR_CATEGORIA[sub]){ it.ncm=NCM_POR_CATEGORIA[sub]; it.ncm_origem='automatico'; }
  renderPreviewImportacaoXML();
}
function alterarSubcategoriaXML(idx, sub){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens[idx]) return;
  var it=importacaoXMLAtual.itens[idx];
  var grupo=categoriaPrincipalPorSubcategoria(sub);
  it.grupo=grupo;
  it.cat=sub;
  it.subcat=sub;
  it.subcategoria=sub;
  if(!ncmValidoApp(it.ncm) && NCM_POR_CATEGORIA[sub]){ it.ncm=NCM_POR_CATEGORIA[sub]; it.ncm_origem='automatico'; }
}
function limparImportacaoXML(){
  importacaoXMLAtual=null;
  var f=document.getElementById('ix-forn'); if(f) f.textContent='—';
  var n=document.getElementById('ix-nota'); if(n) n.textContent='—';
  var l=document.getElementById('ix-lista');
  if(l) l.innerHTML='<div class="imp-row head xml-edit"><div>Produto</div><div>Qtd</div><div>Custo</div><div>Venda</div><div>Categoria</div><div>Subcategoria</div><div>Ação</div></div><div class="imp-row"><div style="grid-column:1/-1;color:var(--txt2);text-align:center;">Nenhum XML carregado</div></div>';
}
function txt(node, tag){
  var el = node.getElementsByTagName(tag)[0];
  return el ? (el.textContent || '').trim() : '';
}

function xmlPrimeiroPorLocalNameFiscalBM(node, localName){
  if(!node) return null;
  localName = String(localName || '');
  var todos = node.getElementsByTagName('*');
  for(var i=0;i<todos.length;i++){
    if(String(todos[i].localName || todos[i].nodeName || '').replace(/^.*:/,'') === localName){
      return todos[i];
    }
  }
  return null;
}

function txtXmlFiscalBM(node, tag){
  if(!node) return '';
  var direto = txt(node, tag);
  if(direto) return direto;
  var el = xmlPrimeiroPorLocalNameFiscalBM(node, tag);
  return el ? String(el.textContent || '').trim() : '';
}

function xmlBlocoFiscalBM(doc, tag){
  return doc.getElementsByTagName(tag)[0] || xmlPrimeiroPorLocalNameFiscalBM(doc, tag) || doc;
}

function localizarCnpjDestinatarioPorEntradasFiscalBM(prod){
  try{
    if(!prod) return '';
    var cod = String(prod.cod || '').trim();
    var eans = (typeof extrairCodigosBarras === 'function') ? extrairCodigosBarras(prod.ean || prod.codigos_barras || '') : [];
    var nome = String(prod.nome || '').trim().toLowerCase();
    var entradas = (DB && typeof DB.get === 'function') ? (DB.get('entradas') || []) : [];
    for(var i=entradas.length-1;i>=0;i--){
      var ent = entradas[i] || {};
      var dest = somenteDigitosFiscalBM(ent.destinatarioCnpj || ent.xml_destinatario_cnpj || ent.cnpj_destinatario || '');
      if(!dest) continue;
      var itens = Array.isArray(ent.itens) ? ent.itens : [];
      for(var j=0;j<itens.length;j++){
        var it = itens[j] || {};
        var itCod = String(it.cod || it.cProd || '').trim();
        if(cod && itCod && cod === itCod) return dest;
        var itEans = (typeof extrairCodigosBarras === 'function') ? extrairCodigosBarras(it.ean || it.codigo_barras || it.codBarras || it.codigoDeBarras || '') : [];
        if(eans.length && itEans.some(function(x){ return eans.indexOf(x) >= 0; })) return dest;
        var itNome = String(it.nome || it.nomeBase || it.xProd || '').trim().toLowerCase();
        if(nome && itNome && nome === itNome) return dest;
      }
    }
  }catch(e){}
  return '';
}
function catByNCM(ncm){
  ncm=String(ncm||'');
  if(ncm.startsWith('64')) return 'Calçados';
  if(ncm.startsWith('61')||ncm.startsWith('62')) return 'Vestidos';
  if(ncm.startsWith('42')) return 'Acessórios';
  return 'Outros';
}
function parseInfAdProd(s){
  s=String(s||'');
  var tam=(s.match(/tam:\s*([^\s]+)/i)||[])[1]||'';
  var cor=(s.match(/INT\.\s*([^\d]+?)(?=\s+\d|\s+tam:|$)/i)||[])[1]||'';
  cor=cor.replace(/\s+/g,' ').trim();
  return {cor:cor,tam:tam};
}
function lerArquivoXML(ev){
  var file = ev.target.files && ev.target.files[0];
  if(!file) return;
  var rd = new FileReader();
  rd.onload = function(e){
    try{
      var xmlText = e.target.result;
      var doc = new DOMParser().parseFromString(xmlText, 'text/xml');
      if(doc.getElementsByTagName('parsererror').length){
        throw new Error('XML inválido');
      }

      var emit = xmlBlocoFiscalBM(doc, 'emit');
      var dest = xmlBlocoFiscalBM(doc, 'dest');
      var ide = xmlBlocoFiscalBM(doc, 'ide');
      var fornecedor = txtXmlFiscalBM(emit,'xNome') || txtXmlFiscalBM(emit,'xFant') || 'Fornecedor';
      var cnpj = somenteDigitosFiscalBM(txtXmlFiscalBM(emit,'CNPJ') || txtXmlFiscalBM(emit,'CPF'));
      var destinatarioCnpj = somenteDigitosFiscalBM(txtXmlFiscalBM(dest,'CNPJ') || txtXmlFiscalBM(dest,'CPF'));
      var numero = txtXmlFiscalBM(ide,'nNF');
      var serie = txtXmlFiscalBM(ide,'serie');
      var emissao = txtXmlFiscalBM(ide,'dhEmi') || txtXmlFiscalBM(ide,'dEmi');

      var dets = Array.prototype.slice.call(doc.getElementsByTagName('det'));
      var itens = dets.map(function(det){
        var prod = det.getElementsByTagName('prod')[0] || det;
        var info = parseInfAdProd(txtXmlFiscalBM(det,'infAdProd'));
        var cod = txtXmlFiscalBM(prod,'cProd');
        var nomeBase = txtXmlFiscalBM(prod,'xProd');
        var nome = nomeBase + (info.cor||info.tam ? ' — ' + [info.cor, info.tam].filter(Boolean).join(' / ') : '');
        var q = Number(txtXmlFiscalBM(prod,'qCom') || 0);
        var custo = Number(txtXmlFiscalBM(prod,'vUnCom') || 0);
        var ean = txtXmlFiscalBM(prod,'cEAN');
        var ncm = txtXmlFiscalBM(prod,'NCM');
        var existente = produtosAtivosBM(DB.get('produtos')||[]).find(function(p){
          return (ean && codigoPertenceProduto(p, ean)) || (cod && String(p.cod||'')===String(cod));
        });
        var precoVenda = existente
          ? Number(existente.preco || 0)
          : Number(custo || 0);
        var subcat = existente
          ? (existente.subcategoria || existente.subcat || existente.cat || '')
          : '';
        if(!subcat || categoriaPrincipalPorSubcategoria(subcat)==='OUTROS'){
          subcat = inferSubcategoriaPorTexto(nomeBase || nome) || 'Outros';
        }
        var grupo = existente
          ? (existente.grupo || categoriaPrincipalPorSubcategoria(subcat) || inferCategoriaPorTexto(nomeBase || nome))
          : (categoriaPrincipalPorSubcategoria(subcat) || inferCategoriaPorTexto(nomeBase || nome));
        if(!grupo || CATEGORIAS_PRINCIPAIS.indexOf(grupo) < 0) grupo = inferCategoriaPorTexto(nomeBase || nome) || 'OUTROS';
        return {
          cod: cod || ('REF'+Math.random().toString(36).slice(2,7).toUpperCase()),
          nome: nome.trim(),
          nomeBase:nomeBase,
          ean: ean,
          ncm: ncm || NCM_POR_CATEGORIA[subcat] || '',
          ncm_origem: ncmValidoApp(ncm) ? 'xml_entrada' : 'automatico',
          origem_fiscal: 'xml_entrada',
          qtd: q,
          custo: custo,
          precoVenda: precoVenda,
          grupo: grupo,
          cat: subcat,
          subcat: subcat,
          subcategoria: subcat,
          desc2: [info.cor ? ('Cor: '+info.cor) : '', info.tam ? ('Tam: '+info.tam) : ''].filter(Boolean).join(' · '),
          existenteId: existente ? existente.id : ''
        };
      });

      importacaoXMLAtual = {
        fornecedor: fornecedor,
        cnpj: cnpj,
        destinatarioCnpj: destinatarioCnpj,
        numero: numero,
        serie: serie,
        emissao: emissao,
        itens: itens,
        xmlText: xmlText
      };
      renderPreviewImportacaoXML();
      toast('✅ XML lido com sucesso!','ok');
    }catch(err){
      console.error(err);
      toast('❌ Não foi possível ler o XML','erro');
      limparImportacaoXML();
    }
  };
  rd.readAsText(file, 'utf-8');
}
function renderPreviewImportacaoXML(){
  var box=document.getElementById('ix-lista');
  if(!box) return;
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens.length){
    limparImportacaoXML();
    return;
  }
  document.getElementById('ix-forn').textContent = importacaoXMLAtual.fornecedor + (importacaoXMLAtual.cnpj ? ' · ' + importacaoXMLAtual.cnpj : '') + (importacaoXMLAtual.destinatarioCnpj ? ' · Dest: ' + importacaoXMLAtual.destinatarioCnpj : '');
  document.getElementById('ix-nota').textContent = 'NF ' + (importacaoXMLAtual.numero||'—') + ' · Série ' + (importacaoXMLAtual.serie||'—') + (importacaoXMLAtual.emissao ? ' · ' + FD(importacaoXMLAtual.emissao) : '');

  var primeiro = importacaoXMLAtual.itens[0] || {};
  preencherCategoriasXML(primeiro.grupo || categoriaPrincipalPorSubcategoria(primeiro.subcategoria || primeiro.subcat || primeiro.cat || '') || 'CALÇADOS');
  preencherSubcatsXML((document.getElementById('ix-cat-principal')||{}).value, primeiro.subcategoria || primeiro.subcat || primeiro.cat || '');

  box.innerHTML = '<div class="imp-row head xml-edit"><div>Produto</div><div>Qtd</div><div>Custo</div><div>Venda</div><div>Categoria</div><div>Subcategoria</div><div>Ação</div></div>' + importacaoXMLAtual.itens.map(function(it, idx){
    var grupo = it.grupo || categoriaPrincipalPorSubcategoria(it.subcategoria || it.subcat || it.cat || '') || 'OUTROS';
    if(CATEGORIAS_PRINCIPAIS.indexOf(grupo) < 0) grupo = 'OUTROS';
    var sub = it.subcategoria || it.subcat || it.cat || 'Outros';
    var listaSub = SUBCATEGORIAS_POR_PRINCIPAL[grupo] || SUBCATEGORIAS_POR_PRINCIPAL.OUTROS || ['Outros'];
    if(listaSub.indexOf(sub) < 0) sub = listaSub[0] || 'Outros';
    it.grupo = grupo;
    it.cat = sub;
    it.subcat = sub;
    it.subcategoria = sub;
    return '<div class="imp-row xml-edit">'+
      '<div><div class="imp-prod">'+it.nome+'</div><div class="imp-sub">'+it.cod+(it.ncm?' · NCM '+it.ncm:'')+(it.ean?' · EAN '+it.ean:'')+'</div></div>'+
      '<div>'+it.qtd+'</div>'+
      '<div>'+R(it.custo)+'</div>'+
      '<div><input class="imp-preco-input" type="number" step="0.01" min="0" value="'+Number(it.precoVenda||0).toFixed(2)+'" onchange="alterarPrecoVendaXML('+idx+', this.value)"></div>'+
      '<div><select class="fi" onchange="alterarCategoriaXML('+idx+', this.value)">'+montarOptionsXML(CATEGORIAS_PRINCIPAIS, grupo)+'</select></div>'+
      '<div><select class="fi" onchange="alterarSubcategoriaXML('+idx+', this.value)">'+montarOptionsXML(listaSub, sub)+'</select></div>'+
      '<div>'+(it.existenteId ? ('Somar em<br><b>'+((produtosAtivosBM(DB.get('produtos')||[]).find(function(p){return String(p.id)===String(it.existenteId);})||{}).nome||'produto existente')+'</b><br><button class="btn bo xs" onclick="vincularItemXMLProdutoExistenteBM('+idx+')">Trocar</button> <button class="btn bd2 xs" onclick="criarNovoItemXMLBM('+idx+')">Criar novo</button>') : ('Criar produto<br><button class="btn bo xs" onclick="vincularItemXMLProdutoExistenteBM('+idx+')">Adicionar existente</button>'))+'</div>'+
    '</div>';
  }).join('');
}
function alterarPrecoVendaXML(idx, valor){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens[idx]) return;
  var n = Number(valor || 0);
  importacaoXMLAtual.itens[idx].precoVenda = isFinite(n) ? n : 0;
}

function confirmarImportacaoXML(){
  if(!importacaoXMLAtual || !importacaoXMLAtual.itens || !importacaoXMLAtual.itens.length){
    toast('⚠️ Carregue um XML primeiro!','warn');
    return;
  }
  var produtos = DB.get('produtos') || [];
  var agora = nowLocalISO();
  var destinatarioCnpj = somenteDigitosFiscalBM(importacaoXMLAtual.destinatarioCnpj || '');
  var origemFiscalStatusXML = classificarOrigemFiscalProdutoApp({origem_estoque:'xml_nfe', xml_destinatario_cnpj:destinatarioCnpj});

  importacaoXMLAtual.itens.forEach(function(it){
    var idx = -1;
    if(it.vincularProdutoId || it.existenteId){
      var alvoId = it.vincularProdutoId || it.existenteId;
      idx = produtos.findIndex(function(p){ return !produtoArquivadoBM(p) && String(p.id) === String(alvoId); });
    }
    if(idx < 0){
      idx = produtos.findIndex(function(p){
        return !produtoArquivadoBM(p) && ((it.ean && codigoPertenceProduto(p, it.ean)) || String(p.cod||'')===String(it.cod));
      });
    }

    if(idx >= 0){
      var p = produtos[idx];
      p.estq = Number(p.estq||0) + Number(it.qtd||0);
      if(it.custo) p.custo = it.custo;
      if(it.ncm){ p.ncm = it.ncm; p.ncm_origem = it.ncm_origem || 'xml_entrada'; p.origem_ncm = p.ncm_origem; }
      if(it.ean){ var listaMerge=extrairCodigosBarras((p.ean||'')+','+it.ean); p.ean = listaMerge.join(','); }
      if(it.desc2) p.desc2 = it.desc2;
      if(Number(it.precoVenda||0) > 0) p.preco = Number(it.precoVenda||0);
      var subXML = it.subcategoria || it.subcat || it.cat || p.subcategoria || p.subcat || p.cat || 'Outros';
      var grupoXML = it.grupo || categoriaPrincipalPorSubcategoria(subXML) || p.grupo || 'OUTROS';
      p.grupo = grupoXML;
      p.cat = subXML;
      p.subcat = subXML;
      p.subcategoria = subXML;
      p.origem = p.origem || '0';
      p.unidade = p.unidade || (categoriaEhCalcado(subXML) ? 'PAR' : 'UN');
      p.csosn = p.csosn || '102';
      p.cfop = p.cfop || '5102';
      p.escala = p.escala || 'S';
      p.origem_estoque = 'xml_nfe';
      p.origem_fiscal = 'xml_entrada';
      p.xml_emitente_cnpj = somenteDigitosFiscalBM(importacaoXMLAtual.cnpj || '');
      p.xml_destinatario_cnpj = destinatarioCnpj;
      p.origem_fiscal_status = origemFiscalStatusXML;
      p.cst_pis = p.cst_pis || '49';
      p.aliq_pis = p.aliq_pis || 0;
      p.cst_cofins = p.cst_cofins || '49';
      p.aliq_cofins = p.aliq_cofins || 0;
      p.updatedAt = agora;
      produtos[idx] = p;
    }else{
      produtos.push({
        id: DB.uid(),
        cod: it.cod,
        nome: it.nome,
        grupo: it.grupo || categoriaPrincipalPorSubcategoria(it.subcategoria || it.subcat || it.cat || '') || 'OUTROS',
        cat: it.subcategoria || it.subcat || it.cat || 'Outros',
        subcat: it.subcategoria || it.subcat || it.cat || 'Outros',
        subcategoria: it.subcategoria || it.subcat || it.cat || 'Outros',
        preco: Number(it.precoVenda||it.custo||0),
        estq: Number(it.qtd||0),
        desc2: it.desc2 || '',
        custo: Number(it.custo||0),
        ean: it.ean || it.codigo_barras || it.codBarras || it.codigoDeBarras || '',
        ncm: it.ncm || (NCM_POR_CATEGORIA[it.subcategoria || it.subcat || it.cat || ''] || ''),
        ncm_origem: it.ncm_origem || (ncmValidoApp(it.ncm) ? 'xml_entrada' : 'automatico'),
        origem_ncm: it.ncm_origem || (ncmValidoApp(it.ncm) ? 'xml_entrada' : 'automatico'),
        origem_fiscal: 'xml_entrada',
        origem_fiscal_status: origemFiscalStatusXML,
        xml_emitente_cnpj: somenteDigitosFiscalBM(importacaoXMLAtual.cnpj || ''),
        xml_destinatario_cnpj: destinatarioCnpj,
        origem: '0',
        unidade: categoriaEhCalcado(it.subcategoria || it.subcat || it.cat || '') ? 'PAR' : 'UN',
        csosn: '102',
        cfop: '5102',
        cst_pis: '49',
        aliq_pis: 0,
        cst_cofins: '49',
        aliq_cofins: 0,
        escala: 'S',
        origem_estoque: 'xml_nfe',
        createdAt: agora,
        updatedAt: agora
      });
    }
  });

  DB.set('produtos', produtos);

  var entradas = DB.get('entradas') || [];
  entradas.push({
    id: DB.uid(),
    fornecedor: importacaoXMLAtual.fornecedor,
    cnpj: importacaoXMLAtual.cnpj,
    destinatarioCnpj: importacaoXMLAtual.destinatarioCnpj || '',
    numero: importacaoXMLAtual.numero,
    serie: importacaoXMLAtual.serie,
    emissao: importacaoXMLAtual.emissao,
    itens: importacaoXMLAtual.itens,
    createdAt: agora
  });
  DB.set('entradas', entradas);

  renderProds();
  renderPGrid();
  fMd('mo-importa-xml');
  limparImportacaoXML();
  toast('✅ Entrada da nota importada!','ok');
}

function selF(btn,f){document.querySelectorAll('.bf').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');vForma=f;}
function buscaVCli(){
  var q=document.getElementById('v-sc').value.trim().toLowerCase();
  var sg=document.getElementById('v-sg');
  if(!q){sg.innerHTML='';return;}
  var res=DB.get('clientes').filter(function(c){return c.nome.toLowerCase().includes(q)||(c.cpf&&c.cpf.includes(q));}).slice(0,5);
  sg.innerHTML=res.map(function(c){return '<div class="sg" onclick="selecionarVCli(\''+c.id+'\')"><b>'+c.nome+'</b> <span class="tm">'+(c.cpf||'')+'</span></div>';}).join('')||(q?'<div class="tm" style="padding:6px 0;">Nenhum encontrado</div>':'');
}
function selecionarVCli(cid){
  var c=DB.get('clientes').find(function(x){return x.id===cid;});
  if(!c) return;
  vCli=c;
  var aberto = saldo(c.id).sd;
  var clienteVendaTxt = c.nome + (c.tel ? ' · ' + c.tel : '') + ' · Em aberto: ' + R(aberto);
  var sc=document.getElementById('v-sc');
  if(sc){ sc.value=clienteVendaTxt; sc.style.color='var(--red2)'; sc.style.fontWeight='800'; sc.readOnly=true; }
  document.getElementById('v-sg').innerHTML='';
  var row=document.getElementById('v-row-busca');
  if(row){
    row.innerHTML='<input class="fi" id="v-sc" value="'+clienteVendaTxt+'" readonly style="flex:1;color:var(--red2);font-weight:800;">'+
    '<button class="btn bh sm" onclick="remCli()">✕ Remover</button>';
  }
  var temLimite=dadosLimiteCliente(c);
  var abreAtraso=(dadosAtrasoCliente(c)!==null);
  if(temLimite.limite && (temLimite.excedeu||temLimite.alerta)){
    verificarLimiteClienteVenda(c);
    // Se também tem atraso, abre após fechar limite (via continuarAlertaLimiteCliente)
    if(abreAtraso) _atrasoCliPendente=c;
  } else if(abreAtraso){
    verificarAtrasoClienteVenda(c);
  }
}
function remCli(){
  vCli=null;
  var row=document.getElementById('v-row-busca');
  if(row){
    row.innerHTML='<input class="fi" id="v-sc" placeholder="Buscar cliente por nome, CPF ou telefone..." oninput="buscaVCli()" style="flex:1">'
      +'<button class="btn br sm" onclick="abrirMdCli(null,&quot;venda&quot;)">➕ Novo</button>'
      +'<button class="btn bh sm" onclick="abrirListaCliVenda()" title="Ver todos os clientes">📋 Lista</button>';
  }
  var sg=document.getElementById('v-sg');
  if(sg) sg.innerHTML='';
  if(document.getElementById('v-cs')) document.getElementById('v-cs').style.display='none';
}
function addItem(){
  var desc=document.getElementById('v-desc').value.trim();
  var preco=parseFloat(String(document.getElementById('v-preco').value||'').replace(',','.'));
  var qty=parseInt(document.getElementById('v-qty').value)||1;
  if(!desc||!preco||preco<=0){toast('⚠️ Preencha descrição e preço!');return;}

  var produtos = DB.get('produtos') || [];
  var descNorm = desc.toLowerCase().trim();
  var p = produtos.find(function(x){
    var nome = String(x.nome||'').toLowerCase().trim();
    var cod = String(x.cod||x.codigo||'').toLowerCase().trim();
    return nome === descNorm || cod === descNorm || codigoPertenceProduto(x, descNorm);
  }) || null;

  var item = {
    id:DB.uid(),
    pid:p ? p.id : '',
    cod:p ? (p.cod||p.codigo||'') : '',
    ean:p ? obterEanPrincipalProduto(p) : '',
    ncm:p ? (p.ncm||'') : '',
    cfop:p ? (p.cfop||'5102') : '5102',
    csosn:p ? (p.csosn||'102') : '102',
    unidade:p ? (p.unidade||'UN') : 'UN',
    origem:p ? (p.origem||'0') : '0',
    desc:p ? (p.nome||desc) : desc,
    nome:p ? (p.nome||desc) : desc,
    preco:Number(preco||0),
    qty:qty
  };

  var ex = cart.find(function(i){
    if(item.pid && i.pid) return String(i.pid)===String(item.pid);
    return String(i.desc||'')===String(item.desc||'') && Number(i.preco||0)===Number(item.preco||0);
  });

  if(ex){
    ex.qty += qty;
    if(!ex.cod && item.cod) ex.cod = item.cod;
    if(!ex.ean && item.ean) ex.ean = item.ean;
    if(!ex.ncm && item.ncm) ex.ncm = item.ncm;
    if(!ex.cfop && item.cfop) ex.cfop = item.cfop;
    if(!ex.csosn && item.csosn) ex.csosn = item.csosn;
    if(!ex.unidade && item.unidade) ex.unidade = item.unidade;
    if(!ex.origem && item.origem) ex.origem = item.origem;
    if(!ex.pid && item.pid) ex.pid = item.pid;
  }else{
    cart.push(item);
  }

  document.getElementById('v-desc').value='';
  document.getElementById('v-preco').value='';
  document.getElementById('v-qty').value='1';
  limparBuscaProdutoManual();
  document.getElementById('v-desc').focus();
  renderCart();
}
function chgQty(id,d){
  var idx=cart.findIndex(function(i){return i.id===id;});if(idx<0)return;
  cart[idx].qty+=d;if(cart[idx].qty<=0)cart.splice(idx,1);renderCart();
}
function renderCart(){
  var el=document.getElementById('cart');
  el.innerHTML=cart.length?cart.map(function(i){
    return '<div class="ci"><div class="cin">'+i.desc+'</div>'+
      '<div class="ciq"><button class="qb" onclick="chgQty(\''+i.id+'\',-1)">−</button><span>'+i.qty+'</span><button class="qb" onclick="chgQty(\''+i.id+'\',1)">+</button></div>'+
      '<div class="civ">'+R(i.preco*i.qty)+'</div></div>';
  }).join(''):'<div class="empty">Adicione itens ↑</div>';
  var subtotal=getCartSubtotal();
  var desconto=getCartDiscount();
  var total=Math.max(0, subtotal-desconto);
  document.getElementById('csub').textContent=R(subtotal);
  document.getElementById('ctot').textContent=R(total);
  var cdesc=document.getElementById('cdesc');
  if(cdesc && document.activeElement!==cdesc){
    cdesc.value=desconto?desconto.toFixed(2).replace('.',','):'';
  }
  setTimeout(function(){
    var cartEl=document.getElementById('cart');
    if(cartEl) cartEl.scrollTop = cartEl.scrollHeight;
  }, 0);
}
function limparVenda(){initVenda();}
function finVenda12(){abrirModalPagamento();}

function garantirPagamentoDivididoUI(){
  var modal=document.getElementById('mo-pag');
  if(!modal) return;
  if(!modal.querySelector('.mo-pag-btn[data-f="dividido"]')){
    var ref=modal.querySelector('.mo-pag-btn');
    var parent=ref ? ref.parentNode : modal;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='mo-pag-btn';
    btn.setAttribute('data-f','dividido');
    btn.setAttribute('onclick',"selPagForma(this,'dividido')");
    btn.textContent='🔀 Pagamento dividido';
    parent.appendChild(btn);
  }
  if(!document.getElementById('pag-div-box')){
    var box=document.createElement('div');
    box.id='pag-div-box';
    box.style.display='none';
    box.style.marginTop='12px';
    box.style.padding='12px';
    box.style.border='1px solid #ddd';
    box.style.borderRadius='12px';
    box.style.background='#fff';
    box.style.color='#111';
    box.innerHTML=''+
      '<div style="font-weight:800;margin-bottom:8px;color:#111;">Pagamento dividido</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
      '<label style="font-size:12px;color:#333;">PIX<input class="fi pag-div-inp" id="pag-div-pix" data-forma="pix" inputmode="decimal" oninput="atualizarPagamentoDividido()" placeholder="0,00" style="background:#fff;color:#111;border:1px solid #ddd;"></label>'+ 
      '<label style="font-size:12px;color:#333;">Dinheiro<input class="fi pag-div-inp" id="pag-div-dinheiro" data-forma="dinheiro" inputmode="decimal" oninput="atualizarPagamentoDividido()" placeholder="0,00" style="background:#fff;color:#111;border:1px solid #ddd;"></label>'+ 
      '<label style="font-size:12px;color:#333;">Débito<input class="fi pag-div-inp" id="pag-div-debito" data-forma="debito" inputmode="decimal" oninput="atualizarPagamentoDividido()" placeholder="0,00" style="background:#fff;color:#111;border:1px solid #ddd;"></label>'+ 
      '<label style="font-size:12px;color:#333;">Crédito<input class="fi pag-div-inp" id="pag-div-credito" data-forma="credito" inputmode="decimal" oninput="atualizarPagamentoDividido()" placeholder="0,00" style="background:#fff;color:#111;border:1px solid #ddd;"></label>'+ 
      '</div>'+ 
      '<div style="margin-top:8px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12px;color:#333;">'+
      '<span>Somado: <b id="pag-div-somado" style="color:#111;">R$ 0,00</b></span>'+ 
      '<span>Falta: <b id="pag-div-falta" style="color:#111;">R$ 0,00</b></span>'+ 
      '</div>';
    modal.appendChild(box);
  }
}
function limparPagamentoDividido(){
  vPagamentosDivididos=null;
  document.querySelectorAll('.pag-div-inp').forEach(function(i){ i.value=''; });
  atualizarPagamentoDividido();
}
function atualizarPagamentoDividido(){
  var total=getCartTotal();
  var soma=0;
  document.querySelectorAll('.pag-div-inp').forEach(function(i){ soma+=dinheiroNum(i.value); });
  var falta=total-soma;
  var somado=document.getElementById('pag-div-somado'); if(somado) somado.textContent=R(soma);
  var faltaEl=document.getElementById('pag-div-falta');
  if(faltaEl){
    if(Math.abs(falta)<=0.01) faltaEl.textContent='R$ 0,00';
    else faltaEl.textContent=(falta>0?'Falta ':'Excedeu ')+R(Math.abs(falta));
  }
}
function obterPagamentoDividido(){
  var lista=[];
  document.querySelectorAll('.pag-div-inp').forEach(function(i){
    var valor=dinheiroNum(i.value);
    if(valor>0) lista.push({forma:i.getAttribute('data-forma'), valor:valor});
  });
  return lista;
}
function abrirModalPagamento(){
  if(!cart.length){toast('⚠️ Carrinho vazio!');return;}
  garantirPagamentoDivididoUI();
  var subtotal=getCartSubtotal();
  var desconto=getCartDiscount();
  var total=getCartTotal();
  var fmt='R$ '+total.toFixed(2).replace('.',',');
  document.getElementById('mo-pag-total').innerHTML=fmt;
  var msub=document.getElementById('mo-pag-sub'); if(msub) msub.textContent='R$ '+subtotal.toFixed(2).replace('.',',');
  var mdesc=document.getElementById('mo-pag-desc'); if(mdesc) mdesc.textContent='R$ '+desconto.toFixed(2).replace('.',',');
  var boxDiv=document.getElementById('pag-div-box'); if(boxDiv) boxDiv.style.display=(vForma==='dividido')?'block':'none';
  atualizarPagamentoDividido();
  document.querySelectorAll('.mo-pag-btn').forEach(function(b){
    var sel=b.getAttribute('data-f')===vForma;
    b.style.background=sel?'var(--red2)':'';
    b.style.color=sel?'#fff':'';
    b.style.borderColor=sel?'var(--red2)':'';
    b.setAttribute('tabindex','0');
  });
  document.getElementById('mo-pag').style.display='flex';
  setTimeout(function(){
    var atual=document.querySelector('.mo-pag-btn[data-f="'+vForma+'"]') || document.querySelector('.mo-pag-btn');
    if(atual){ atual.focus(); }
  },50);
}
function fecharModalPagamento(){
  document.getElementById('mo-pag').style.display='none';
}
function selPagForma(btn,forma){
  vForma=forma;
  document.querySelectorAll('.mo-pag-btn').forEach(function(b){
    b.style.background='';b.style.color='';b.style.borderColor='';
  });
  btn.style.background='var(--red2)';btn.style.color='#fff';btn.style.borderColor='var(--red2)';
  var boxDiv=document.getElementById('pag-div-box'); if(boxDiv) boxDiv.style.display=(forma==='dividido')?'block':'none';
  if(forma!=='dividido') vPagamentosDivididos=null;
  atualizarPagamentoDividido();
}

function focarOpcaoPagamento(passos){
  var botoes=Array.from(document.querySelectorAll('.mo-pag-btn'));
  if(!botoes.length) return;
  var atual=document.activeElement;
  var idx=botoes.findIndex(function(b){ return b===atual; });
  if(idx<0){
    idx=botoes.findIndex(function(b){ return b.getAttribute('data-f')===vForma; });
  }
  if(idx<0) idx=0;
  idx=(idx+passos+botoes.length)%botoes.length;
  botoes[idx].focus();
  selPagForma(botoes[idx], botoes[idx].getAttribute('data-f'));
}

document.addEventListener('keydown', function(e){
  var modal=document.getElementById('mo-pag');
  if(!modal || modal.style.display!=='flex') return;

  var focoDentro = modal.contains(document.activeElement);
  if(!focoDentro && e.key !== 'Escape') return;

  if(e.key==='Tab'){
    e.preventDefault();
    focarOpcaoPagamento(e.shiftKey ? -1 : 1);
    return;
  }

  if(e.key==='ArrowRight' || e.key==='ArrowDown'){
    e.preventDefault();
    focarOpcaoPagamento(1);
    return;
  }

  if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
    e.preventDefault();
    focarOpcaoPagamento(-1);
    return;
  }

  if(e.key==='Enter'){
    e.preventDefault();
    confirmarPagamento();
    return;
  }

  if(e.key==='Escape'){
    e.preventDefault();
    fecharModalPagamento();
    return;
  }
});
function confirmarPagamento(){
  if(vForma==='fiado'&&!vCli){toast('⚠️ Selecione um cliente para Crediário!');return;}
  if(vForma==='dividido'){
    var lista=obterPagamentoDividido();
    var soma=lista.reduce(function(s,p){return s+p.valor;},0);
    var total=getCartTotal();
    if(!lista.length){toast('⚠️ Informe pelo menos uma forma de pagamento.');return;}
    if(Math.abs(soma-total)>0.01){toast('⚠️ A soma do pagamento dividido precisa fechar o total da venda.');return;}
    vPagamentosDivididos=lista;
  }else{
    vPagamentosDivididos=null;
  }
  fecharModalPagamento();
  finalizarVenda();
}
var _finalizandoVenda=false;
function finalizarVenda(){
  if(_finalizandoVenda) return;
  if(!cart.length){toast('⚠️ Carrinho vazio!');return;}
  if(vForma==='fiado'&&!vCli){toast('⚠️ Selecione um cliente para crediário!');return;}
  _finalizandoVenda=true;
  try{
    var subtotal=getCartSubtotal();
    var desconto=getCartDiscount();
    var total=getCartTotal();
    var stamp=nowLocalISO();
    var itensVenda=JSON.parse(JSON.stringify(cart));
    var venda={id:DB.uid(),data:stamp,createdAt:stamp,updatedAt:stamp,deletedAt:'',cid:vCli?vCli.id:null,cliNome:vCli?vCli.nome:'Balcão',forma:vForma,itens:itensVenda,subtotal:subtotal,desconto:desconto,total:total};
    if(vForma==='dividido') venda.pagamentos=JSON.parse(JSON.stringify(vPagamentosDivididos||[]));

    ajustarEstoqueVenda(venda.itens, 'subtrair');

    var vendas=DB.get('vendas')||[];
    vendas.push(venda);
    DB.set('vendas',vendas);

    if(vForma==='fiado'&&vCli){
      var crds=DB.get('creditos')||[];
      crds.push({id:DB.uid(),cid:vCli.id,data:venda.data,desc:'Venda Crediário: '+itensVenda.map(function(i){return i.desc;}).join(', '),val:total,vid:venda.id});
      DB.set('creditos',crds);
    }

    var cliComp=vCli, vendaComp=venda;
    var cliNome=vCli?vCli.nome:'Balcão';
    var totalFmt='R$ '+total.toFixed(2).replace('.',',');

    remCli();
    cart=[];vCli=null;vForma='dinheiro';vDesconto=0;vPagamentosDivididos=null;
    var desc=document.getElementById('v-desc'); if(desc) desc.value='';
    var preco=document.getElementById('v-preco'); if(preco) preco.value='';
    var qty=document.getElementById('v-qty'); if(qty) qty.value='1';
    renderCart();
    toast('✅ Venda finalizada! '+totalFmt+' — '+cliNome,'ok');

    setTimeout(function(){
      try{renderProds();}catch(e){}
      try{renderPGrid();}catch(e){}
      try{if(typeof renderDash==='function') renderDash();}catch(e){}
      try{if(typeof renderVendas==='function') renderVendas();}catch(e){}
      try{if(typeof renderCx==='function') renderCx();}catch(e){}
      try{if(typeof syncNow==='function') syncNow();}catch(e){}
    },60);

    setTimeout(function(){
      try{mostrarComp(vendaComp,cliComp,null);}catch(e){}
    },220);
  } finally {
    setTimeout(function(){ _finalizandoVenda=false; }, 250);
  }
}

// RECEBIMENTO
var rCli=null;
function initReceb(){
  rCli=null;document.getElementById('r-sc').value='';document.getElementById('r-sg').innerHTML='';
  document.getElementById('r-painel').style.display='none';document.getElementById('r-val').value='';document.getElementById('r-obs').value='';
}

function atualizarLayoutReceb(){
  var bc=document.getElementById('r-busca-card');
  if(!bc) return;
  if(rCli){
    bc.classList.add('recolhido');
  }else{
    bc.classList.remove('recolhido');
  }
}





function abrirListaDevedores(){
  filtrarListaDevedores();
  abrirMd('mo-lista-devedores');
  setTimeout(function(){
    var b=document.getElementById('mo-lista-devedores-busca');
    if(b){ b.value=''; b.focus(); filtrarListaDevedores(); }
  },100);
}

function filtrarListaDevedores(){
  var q=((document.getElementById('mo-lista-devedores-busca')||{value:''}).value||'').toLowerCase();
  var lista=(DB.get('clientes')||[]).map(function(c){
    var s=saldo(c.id);
    return {c:c, sd:Number(s.sd||0), tf:Number(s.tf||0), tp:Number(s.tp||0)};
  }).filter(function(x){
    return x.sd>0 && (!q || (x.c.nome||'').toLowerCase().includes(q) || (x.c.cpf||'').toLowerCase().includes(q));
  }).sort(function(a,b){
    return (a.c.nome||'').localeCompare((b.c.nome||''), 'pt-BR');
  });

  var container=document.getElementById('mo-lista-devedores-items');
  if(!container) return;

  if(!lista.length){
    container.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt2);">Nenhum cliente com débito em aberto</div>';
    return;
  }

  container.innerHTML=lista.map(function(x){
    return '<div onclick="selecionarCliDevedor(\''+x.c.id+'\')" style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid var(--bdr);cursor:pointer;border-radius:8px;transition:background .15s;" '+
      'onmouseenter="this.style.background=\'var(--s2)\'" onmouseleave="this.style.background=\'\'">'+
      '<div style="min-width:0;flex:1;">'+
        '<div style="font-weight:800;font-size:14px;color:var(--txt);">'+x.c.nome+'</div>'+
        '<div style="font-size:12px;color:var(--txt2);">Em aberto: <b>'+R(x.sd)+'</b> · '+(x.c.cpf||'Sem CPF')+(x.c.tel?' · '+x.c.tel:'')+'</div>'+
      '</div>'+
      '<span style="font-size:20px;flex-shrink:0;">▶</span>'+
    '</div>';
  }).join('');
}

function selecionarCliDevedor(cid){
  selecionarRCli(cid);
  fMd('mo-lista-devedores');
  toast('✅ Cliente selecionado!','ok');
}

function buscaRCli(){
  var q=document.getElementById('r-sc').value.trim().toLowerCase();
  var sg=document.getElementById('r-sg');if(!q){sg.innerHTML='';return;}
  var res=DB.get('clientes').filter(function(c){return c.nome.toLowerCase().includes(q)||(c.cpf&&c.cpf.includes(q));}).slice(0,6);
  sg.innerHTML=res.map(function(c){
    var sd=saldo(c.id).sd;
    return '<div class="sg" style="display:flex;justify-content:space-between;align-items:center;" onclick="selecionarRCli(\''+c.id+'\')">'+
      '<span><b>'+c.nome+'</b><br><span class="tm">'+(c.cpf||'')+(c.tel?' · '+c.tel:'')+'</span></span>'+
      '<span style="font-weight:800;color:'+(sd>0.01?'var(--red2)':'#2ecc71')+'">'+R(sd)+'</span></div>';
  }).join('')||(q?'<div class="tm" style="padding:6px 0;">Nenhum encontrado</div>':'');
}
function selecionarRCli(cid){
  atualizarLayoutReceb();
  var c=DB.get('clientes').find(function(x){return x.id===cid;});if(!c)return;
  rCli=c;document.getElementById('r-sc').value=c.nome;document.getElementById('r-sg').innerHTML='';renderRecebPainel();
}
function renderRecebPainel(){
  if(!rCli)return;
  var s=saldo(rCli.id);
  document.getElementById('r-nome').textContent=rCli.nome;
  document.getElementById('r-info').textContent=(rCli.cpf||'')+(rCli.tel?' · '+rCli.tel:'');
  document.getElementById('r-saldo').textContent=R(s.sd);
  document.getElementById('r-tf').textContent=R(s.tf);document.getElementById('r-tp').textContent=R(s.tp);
  document.getElementById('r-val').value='';
  var crds=creditosValidos().filter(function(f){return f.cid===rCli.id;});
  document.getElementById('r-tb').innerHTML=crds.map(function(f){
    return '<tr><td>'+FD(f.data)+'</td><td>'+f.desc+'</td><td class="txt-r">'+R(f.val)+'</td></tr>';
  }).join('')||'<tr><td colspan="3" style="text-align:center;padding:14px;color:var(--txt2);">Sem crediário</td></tr>';
  document.getElementById('r-painel').style.display='block';
}

function limparRCli(){
  rCli=null;
  var sc=document.getElementById('r-sc'); if(sc) sc.value='';
  var sg=document.getElementById('r-sg'); if(sg) sg.innerHTML='';
  var rp=document.getElementById('r-painel'); if(rp) rp.style.display='none';
  var rv=document.getElementById('r-val'); if(rv) rv.value='';
  atualizarLayoutReceb();
}
function confirmarPag(){

  if(!rCli){toast('⚠️ Selecione um cliente!');return;}
  var val=parseFloat(document.getElementById('r-val').value);
  if(!val||val<=0){toast('⚠️ Informe o valor!');return;}
  var stamp=nowLocalISO(); var pag={id:DB.uid(),cid:rCli.id,data:stamp,createdAt:stamp,updatedAt:stamp,deletedAt:'',val:val,forma:document.getElementById('r-forma').value,obs:document.getElementById('r-obs').value};
  var pgs=DB.get('pagamentos');pgs.push(pag);DB.set('pagamentos',pgs);
  toast('✅ Pagamento registrado!','ok');var cliComp=rCli;document.getElementById('r-obs').value='';renderRecebPainel();mostrarComp(null,cliComp,pag);
}
function telefoneWhatsAppClienteBM(cli){
  var num = String((cli && (cli.tel || cli.telefone)) || '').replace(/\D/g,'');
  if(!num) return '';

  // Se vier com 10 ou 11 dígitos, considera Brasil e acrescenta DDI 55.
  if(!num.startsWith('55')) num = '55' + num;

  return num;
}

function dataMovimentoMsBM(valor){
  var d = parseAnyDate(valor);
  return d ? d.getTime() : 0;
}


function calcularProximoVencimentoCrediarioBM(cli){
  if(!cli || !cli.id) return null;

  var TOLERANCIA_QUITACAO = 1.00;
  var crds = creditosValidos()
    .filter(function(f){ return String((f && f.cid) || '') === String(cli.id); })
    .sort(function(a,b){ return dataMovimentoMsBM(a.data || a.createdAt) - dataMovimentoMsBM(b.data || b.createdAt); });

  var pgs = pagamentosValidos()
    .filter(function(p){ return String((p && p.cid) || '') === String(cli.id); });

  if(!crds.length) return null;

  var totalPagamentos = pgs.reduce(function(s,p){
    return s + dinheiroNum(p.val != null ? p.val : p.valor);
  }, 0);

  var acumuladoCompras = 0;
  var compraAberta = null;

  for(var i=0; i<crds.length; i++){
    acumuladoCompras += dinheiroNum(crds[i].val != null ? crds[i].val : crds[i].valor);
    if(acumuladoCompras - totalPagamentos > TOLERANCIA_QUITACAO){
      compraAberta = crds[i];
      break;
    }
  }

  if(!compraAberta) return null;

  var base = parseAnyDate(compraAberta.data || compraAberta.createdAt);
  if(!base) return null;

  var venc = new Date(base.getTime());
  venc.setDate(venc.getDate() + 30);

  return {
    data: venc,
    emAtraso: venc.getTime() < new Date().setHours(0,0,0,0),
    compraData: base
  };
}

function montarExtratoWpp60DiasBM(cli){
  var hoje = new Date();
  var inicio = new Date(hoje.getTime() - (60 * 24 * 60 * 60 * 1000));
  var inicioMs = inicio.getTime();
  var fimMs = hoje.getTime();
  var s = saldo(cli.id);

  var creditos = creditosValidos().filter(function(f){
    if(String((f && f.cid) || '') !== String(cli.id)) return false;
    var ms = dataMovimentoMsBM(f.data || f.createdAt);
    return ms && ms >= inicioMs && ms <= fimMs;
  }).map(function(f){
    return {
      tipo:'compra',
      data:f.data || f.createdAt || '',
      desc:f.desc || f.descricao || 'Compra no crediário',
      valor:dinheiroNum(f.val != null ? f.val : f.valor)
    };
  });

  var pagamentos = pagamentosValidos().filter(function(p){
    if(String((p && p.cid) || '') !== String(cli.id)) return false;
    var ms = dataMovimentoMsBM(p.data || p.createdAt);
    return ms && ms >= inicioMs && ms <= fimMs;
  }).map(function(p){
    var forma = String(p.forma || p.forma_pagamento || '').trim();
    var obs = String(p.obs || '').trim();
    var desc = 'Pagamento';
    if(forma) desc += ' ' + FF(forma).replace(/^.*? /,'');
    if(obs) desc += ' - ' + obs;
    return {
      tipo:'pagamento',
      data:p.data || p.createdAt || '',
      desc:desc,
      valor:dinheiroNum(p.val != null ? p.val : p.valor)
    };
  });

  var movs = creditos.concat(pagamentos).sort(function(a,b){
    return dataMovimentoMsBM(a.data) - dataMovimentoMsBM(b.data);
  });

  var totalComprasPeriodo = creditos.reduce(function(t,m){ return t + dinheiroNum(m.valor); }, 0);
  var totalPagamentosPeriodo = pagamentos.reduce(function(t,m){ return t + dinheiroNum(m.valor); }, 0);
  var saldoAnterior = Math.max(0, dinheiroNum(s.sd) - totalComprasPeriodo + totalPagamentosPeriodo);

  var linhas = [];
  linhas.push('🛍️ *BELA MODAS*');
  linhas.push('');
  linhas.push('Olá, ' + (cli.nome || 'cliente') + '!');
  linhas.push('Segue seu extrato de crediário dos últimos 60 dias.');
  linhas.push('');
  linhas.push('*Período:* ' + FD(inicio.toISOString()) + ' a ' + FD(hoje.toISOString()));
  linhas.push('');
  linhas.push('Saldo anterior: ' + R(saldoAnterior));
  linhas.push('');

  if(!movs.length){
    linhas.push('Nenhuma movimentação nos últimos 60 dias.');
  }else{
    linhas.push('*Movimentações:*');
    movs.forEach(function(m){
      var sinal = m.tipo === 'compra' ? '+' : '-';
      linhas.push(FD(m.data) + ' - ' + m.desc + ': ' + sinal + ' ' + R(m.valor));
    });
  }

  linhas.push('');
  linhas.push('------------------------------');
  linhas.push('Compras no período: ' + R(totalComprasPeriodo));
  linhas.push('Pagamentos no período: ' + R(totalPagamentosPeriodo));
  linhas.push('*Saldo atual: ' + R(s.sd) + '*');

  var proxVenc = calcularProximoVencimentoCrediarioBM(cli);
  if(dinheiroNum(s.sd) <= 0.01){
    linhas.push('Situação: ✅ Sem pendências');
  }else if(proxVenc && proxVenc.data){
    linhas.push('Próximo vencimento: ' + FD(proxVenc.data) + (proxVenc.emAtraso ? ' ⚠️ Em atraso' : ''));
  }else{
    linhas.push('Próximo vencimento: não identificado');
  }

  linhas.push('------------------------------');
  linhas.push('');
  linhas.push('Obrigada pela preferência!');
  linhas.push('Bela Modas');

  return linhas.join('\n');
}

function wppExtrato(){
  if(!rCli){toast('⚠️ Selecione um cliente!');return;}

  var num = telefoneWhatsAppClienteBM(rCli);
  if(!num){toast('⚠️ Cliente sem telefone!');return;}

  var msg = montarExtratoWpp60DiasBM(rCli);
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank');
}

function obterMovimentacoesCli(cid){
  var movs = [];

  var creditos = creditosValidos();
  creditos.filter(function(f){
    return String((f && f.cid) || '') === String(cid || '');
  }).forEach(function(f){
    movs.push({
      id:f.id || f.vendaId || f.sid || '',
      tipoMov:'compra',
      origem:f,
      tipo:'Compra',
      data:f.data || f.createdAt || '',
      descricao:f.desc || f.descricao || 'Compra no crediário',
      valor:Number(f.val || f.valor || 0),
      classe:'txt-r'
    });
  });

  var pagamentos = pagamentosValidos();
  pagamentos.filter(function(p){
    return String((p && p.cid) || '') === String(cid || '');
  }).forEach(function(p){
    var forma = String(p.forma || p.forma_pagamento || '').trim();
    var obs = String(p.obs || '').trim();
    var desc = 'Pagamento';
    if(forma) desc += ' • ' + forma.toUpperCase();
    if(obs) desc += ' • ' + obs;
    movs.push({
      id:p.id || '',
      tipoMov:'recebimento',
      origem:p,
      tipo:'Recebimento',
      data:p.data || p.createdAt || '',
      descricao:desc,
      valor:Number(p.val || p.valor || 0),
      classe:'txt-g'
    });
  });

  movs.sort(function(a,b){
    var ta = (typeof toMillis_==='function') ? toMillis_(a.data || 0) : new Date(a.data || 0).getTime();
    var tb = (typeof toMillis_==='function') ? toMillis_(b.data || 0) : new Date(b.data || 0).getTime();
    return tb - ta;
  });

  return movs;
}

function renderMovimentacoesCliModal(){
  var tb = document.getElementById('mov-cli-tb');
  var titulo = document.getElementById('mov-cli-titulo');
  if(!tb || !titulo) return;

  if(!rCli){
    titulo.textContent = 'Movimentações';
    tb.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:14px;color:var(--txt2);">Selecione um cliente</td></tr>';
    return;
  }

  titulo.textContent = 'Movimentações — ' + (rCli.nome || '');

  var movs = obterMovimentacoesCli(rCli.id);

  tb.innerHTML = movs.map(function(m){
    var acao = '';
    if(m.id){
      acao = '<button class="btn bo xs" onclick="reenviarComprovanteMovCli(\'' + String(m.id).replace(/'/g,'\\\'') + '\',\'' + (m.tipoMov||'') + '\')" title="Reenviar comprovante no WhatsApp">📱 Reenviar</button>';
    }else{
      acao = '<span class="tm">—</span>';
    }
    return '<tr>' +
      '<td>' + FD(m.data) + '</td>' +
      '<td><b>' + m.tipo + '</b><span class="tm">' + m.descricao + '</span></td>' +
      '<td class="' + m.classe + '">' + R(m.valor) + '</td>' +
      '<td style="text-align:right;">' + acao + '</td>' +
    '</tr>';
  }).join('') || '<tr><td colspan="4" style="text-align:center;padding:14px;color:var(--txt2);">Sem movimentação</td></tr>';
}

function abrirMovimentacoesCli(){
  if(!rCli){
    toast('⚠️ Selecione um cliente!');
    return;
  }
  renderMovimentacoesCliModal();
  abrirMd('mo-mov-cli');
}





function renderCobranca(){
  var dias=parseInt(document.getElementById('inad-dias').value)||30;
  var clis=DB.get('clientes');
  var inad=clis.map(function(c){return{c:c,sd:saldo(c.id).sd,dias:diasSemPag(c.id)};})
    .filter(function(x){return x.sd>0.01&&x.dias>=dias;})
    .sort(function(a,b){return b.dias-a.dias;});
  var totalInad=inad.reduce(function(s,x){return s+x.sd;},0);
  document.getElementById('inad-stats').innerHTML=
    '<div class="st sto"><div class="sl">Inadimplentes</div><div class="sv">'+inad.length+'</div></div>'+
    '<div class="st str"><div class="sl">Total em Aberto</div><div class="sv">'+R(totalInad)+'</div></div>';
  if(!inad.length){document.getElementById('inad-lista').innerHTML='';return;}
  document.getElementById('inad-lista').innerHTML=inad.map(function(x){
    var c=x.c;
    return '<div class="inad-card">'+
      '<div class="inad-info">'+
        '<div class="inad-nome">'+c.nome+'</div>'+
        '<div class="inad-dias">⏰ '+x.dias+' dias sem pagamento</div>'+
        '<div class="tm">'+(c.cpf||'')+(c.tel?' · '+c.tel:'')+'</div>'+
      '</div>'+
      '<div style="text-align:right;">'+
        '<div class="tm">Saldo devedor</div>'+
        '<div class="inad-saldo">'+R(x.sd)+'</div>'+
      '</div>'+
      '<div class="fr">'+
        (c.tel?'<button class="btn bo sm" onclick="wppCobrar(\''+c.id+'\')">📱 Cobrar WPP</button>':
        '<span class="tm">Sem telefone</span>')+
        '<button class="btn bb sm" onclick="irReceb(\''+c.id+'\')">💰 Receber</button>'+
      '</div>'+
    '</div>';
  }).join('');
}
function cobrarTodos(){
  var dias=parseInt(document.getElementById('inad-dias').value)||30;
  var clis=DB.get('clientes');
  var inad=clis.filter(function(c){return saldo(c.id).sd>0.01&&diasSemPag(c.id)>=dias&&c.tel;});
  if(!inad.length){toast('Nenhum cliente com telefone para cobrar!','warn');return;}
  if(!confirm('Enviar mensagem de cobrança para '+inad.length+' cliente(s) via WhatsApp?'))return;
  inad.forEach(function(c,i){
    setTimeout(function(){wppCobrar(c.id);},i*800);
  });
  toast('Abrindo WhatsApp para '+inad.length+' cliente(s)...','warn');
}
function wppCobrar(cid){
  var c=DB.get('clientes').find(function(x){return x.id===cid;});
  if(!c||!c.tel){toast('⚠️ Cliente sem telefone!');return;}
  var s=saldo(c.id),dias=diasSemPag(c.id);
  var num=c.tel.replace(/\D/g,'');if(!num.startsWith('55'))num='55'+num;
  var defMsg='Olá, {nome}! 😊\n\nAqui é a *Bela Modas*! 👗\n\nVocê tem um crediário em aberto de *{saldo}* há {dias} dias.\n\nQuando puder entre em contato! 💕\n📞 31 99733-7304\n📍 @bela_modaspetro';
  var tmpl=getCfg('msgCob')||defMsg;
  var msg=tmpl.replace(/\{nome\}/g,c.nome).replace(/\{saldo\}/g,R(s.sd)).replace(/\{dias\}/g,String(dias));
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
}

function irReceb(cid){
  ir('receb');setTimeout(function(){selecionarRCli(cid);},100);}

// COMPROVANTE
var _comp={};
function mostrarComp(venda,cli,pag){
  _comp={venda:venda,cli:cli,pag:pag};
  var header='<div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:10px;margin-bottom:12px;">'+
    '<div style="font-size:20px;font-weight:900;color:#c0392b;">👗 Bela Modas</div>'+
    '<div style="font-size:11px;color:#888;">31 99733-7304 · @bela_modaspetro</div></div>';
  var html='';
  if(venda){
    html=header+'<div style="font-size:13px;line-height:1.9;margin-bottom:10px;">'+
      '<b>COMPROVANTE DE VENDA</b><br><b>Data:</b> '+FDT(venda.data)+'<br><b>Cliente:</b> '+venda.cliNome+'<br><b>Pagamento:</b> '+textoPagamentosVenda(venda)+'</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">'+
      '<tr style="background:#f0f0f0;"><th style="padding:5px;text-align:left;">Item</th><th style="padding:5px;text-align:center;">Qtd</th><th style="padding:5px;text-align:right;">Valor</th></tr>'+
      venda.itens.map(function(i){return '<tr><td style="padding:5px;border-bottom:1px solid #eee;">'+i.desc+'</td><td style="padding:5px;text-align:center;border-bottom:1px solid #eee;">'+i.qty+'</td><td style="padding:5px;text-align:right;border-bottom:1px solid #eee;">'+R(i.preco*i.qty)+'</td></tr>';}).join('')+
      '</table><div style="border-top:2px dashed #ccc;margin-top:10px;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:900;"><span>TOTAL</span><span style="color:#c0392b;">'+R(venda.total)+'</span></div>'+
      '<div style="text-align:center;margin-top:12px;font-size:11px;color:#999;">Obrigada pela preferência! 💕</div>';
  }else if(pag){
    html=header+'<div style="font-size:13px;line-height:1.9;margin-bottom:10px;">'+
      '<b>RECIBO DE PAGAMENTO</b><br><b>Cliente:</b> '+(cli?cli.nome:'')+'<br><b>Data:</b> '+FDT(pag.data)+'<br><b>Forma:</b> '+FF(pag.forma)+(pag.obs?'<br><b>Obs:</b> '+pag.obs:'')+'</div>'+
      '<div style="border-top:2px dashed #ccc;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:900;"><span>VALOR PAGO</span><span style="color:#27ae60;">'+R(pag.val)+'</span></div>'+
      '<div style="text-align:center;margin-top:12px;font-size:11px;color:#999;">Obrigada! 💕</div>';
  }
  document.getElementById('mo-comp-b').innerHTML='<div id="ci" style="font-family:Nunito,sans-serif;">'+html+'</div>';
  abrirMd('mo-comp');
}
function printComp(){var el=document.getElementById('ci');if(!el)return;document.getElementById('pz').innerHTML=el.innerHTML;window.print();}
function wppComp(){
  var d=_comp,c=d.cli;
  if(!c||!c.tel){toast('⚠️ Cliente sem telefone!');return;}
  var num=c.tel.replace(/\D/g,'');if(!num.startsWith('55'))num='55'+num;
  var msg='';
  if(d.venda){
    var itens=d.venda.itens.map(function(i){return '• '+i.desc+' x'+i.qty+' = '+R(i.preco*i.qty);}).join('\n');
    var tpl=getCfg('msg_rec',MSG_REC_PAD);
    msg=tpl.replace(/{nome}/g,c.nome).replace(/{itens}/g,itens).replace(/{total}/g,R(d.venda.total)).replace(/{forma}/g,textoPagamentosVenda(d.venda)).replace(/{data}/g,FDT(d.venda.data));
  }else if(d.pag){
    var tplPag=getCfg('msgPag','👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Recibo de Pagamento*\nValor pago: *{valor}*\nForma: {forma}\nData: {data}\n\nObrigada! 💕\n📞 31 99733-7304');
    msg=tplPag.replace(/{nome}/g,c.nome).replace(/{valor}/g,R(d.pag.val)).replace(/{forma}/g,FF(d.pag.forma)).replace(/{data}/g,FDT(d.pag.data));
  }
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
}

// CAIXA

function renderCrediario(){
  var mes=parseInt(document.getElementById('cr-m').value), ano=parseInt(document.getElementById('cr-a').value);
  if(isNaN(ano))return;
  var clis=DB.get('clientes');
  var vendasCred=DB.get('vendas').filter(function(v){
    var d=new Date(v.data||v.createdAt||0);
    var forma=String(v.forma||v.forma_pagamento||'').toLowerCase();
    return d.getMonth()===mes&&d.getFullYear()===ano&&(forma==='fiado'||forma==='crediario'||forma==='crediário');
  });
  var totalVendidoMes=vendasCred.reduce(function(s,v){return s+Number(v.total||0);},0);
  var totalPagoMes=DB.get('pagamentos').filter(function(p){
    var d=new Date(p.data||p.createdAt||0);return d.getMonth()===mes&&d.getFullYear()===ano;
  }).reduce(function(s,p){return s+Number(p.val!=null?p.val:p.valor||0);},0);
  var clientesCred=clis.filter(function(c){return saldo(c.id).sd>0.01;});
  var totalAberto=clientesCred.reduce(function(s,c){return s+saldo(c.id).sd;},0);

  var st=document.getElementById('cr-st');
  if(st)st.innerHTML=
    '<div class="st str"><div class="sl">Total a Receber</div><div class="sv">'+R(totalAberto)+'</div><span class="tm">'+clientesCred.length+' clientes</span></div>'+
    '<div class="st stgo"><div class="sl">Crediário no Mês</div><div class="sv">'+R(totalVendidoMes)+'</div><span class="tm">'+vendasCred.length+' venda(s)</span></div>'+
    '<div class="st stb"><div class="sl">Recebido no Mês</div><div class="sv">'+R(totalPagoMes)+'</div></div>'+
    '<div class="st stg"><div class="sl">Saldo Líquido</div><div class="sv">'+R(totalAberto)+'</div></div>';

  var tb=document.getElementById('cr-tb');
  if(!tb)return;

  var rows=clientesCred.map(function(c){
    var s=saldo(c.id), dias=diasSemPag(c.id);
    var cor=dias>=30?'var(--red2)':dias>=15?'var(--orange)':'var(--txt)';
    var cid=c.id;
    var btReceb='<button class="btn bb xs" onclick="irCliReceb(\''+cid+'\')" title="Receber">💰</button>';
    var btWpp=c.tel?'<button class="btn bo xs" onclick="wppCobrar(\''+cid+'\')" title="WhatsApp">📱</button>':'';
    return '<tr>'+
      '<td><b>'+c.nome+'</b>'+(c.tel?'<br><span class="tm">'+c.tel+'</span>':'')+'</td>'+
      '<td style="color:var(--red2);font-weight:800;">'+R(s.tf)+'</td>'+
      '<td style="color:var(--green);font-weight:800;">'+R(s.tp)+'</td>'+
      '<td style="color:var(--red2);font-weight:800;font-size:15px;">'+R(s.sd)+'</td>'+
      '<td style="color:'+cor+';font-weight:800;">'+dias+'d</td>'+
      '<td><span style="display:flex;gap:5px;">'+btReceb+btWpp+'</span></td></tr>';
  }).join('');

  tb.innerHTML=rows||'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--txt2);">Nenhum cliente com crediário em aberto 🎉</td></tr>';
}


// ================= STATUS VISUAL NFC-E =================
function nfceStatusInfo(v){
  v = v || {};
  var raw = String(v.nfce_status || v.status_nfce || v.statusNfce || '').toLowerCase();
  var cancel = v.nfce_cancelamento || v.cancelamento || {};
  var cStat = String(v.nfce_cstat || v.cStat || (cancel && cancel.cStat) || '').trim();
  var motivo = String(v.nfce_xmotivo || v.xMotivo || (cancel && cancel.xMotivo) || '').trim();
  var prot = String(v.nfce_protocolo || v.protocolo || v.nProt || (cancel && (cancel.nProt || cancel.nProtCancelamento)) || '').trim();
  var temNota = !!(v.nfce_numero || v.nfce_chave || v.nfce_xml_url || v.nfce_pdf_url || raw || cStat || prot);

  if(!temNota){
    return {classe:'sem', label:'SEM NFC-e', icone:'⚪', cor:'var(--txt2)', detalhe:''};
  }

  if(raw.indexOf('cancel') >= 0 || (cancel && cancel.cancelado) || cStat === '135' || cStat === '155'){
    return {classe:'cancelada', label:'CANCELADA', icone:'⚫', cor:'var(--txt2)', detalhe: prot ? 'Prot. cancelamento: '+prot : motivo};
  }

  if(raw.indexOf('rejeit') >= 0 || raw.indexOf('erro') >= 0 || raw.indexOf('falha') >= 0){
    return {classe:'rejeitada', label:'REJEITADA', icone:'🔴', cor:'var(--red2)', detalhe: motivo || (cStat ? 'SEFAZ '+cStat : '')};
  }

  if(raw.indexOf('autoriz') >= 0 || cStat === '100' || prot){
    return {classe:'autorizada', label:'AUTORIZADA', icone:'🟢', cor:'var(--green)', detalhe: prot ? 'Protocolo: '+prot : ''};
  }

  if(raw.indexOf('pend') >= 0 || raw.indexOf('homolog') >= 0 || raw.indexOf('emitida') >= 0 || temNota){
    return {classe:'pendente', label:'PENDENTE', icone:'🟡', cor:'var(--gold)', detalhe: motivo || 'Aguardando autorização SEFAZ'};
  }

  return {classe:'pendente', label:'PENDENTE', icone:'🟡', cor:'var(--gold)', detalhe: motivo || ''};
}

function nfceBadgeHTML(v, compacto){
  var s = nfceStatusInfo(v);
  if(s.classe === 'sem' && compacto) return '';

  var title = (s.detalhe || s.label || '').replace(/"/g,'&quot;');

  // No Caixa usamos versão pequena para não quebrar o layout.
  if(compacto){
    return '<span class="nfce-badge-mini nfce-'+s.classe+'" title="'+title+'" '+
      'style="display:inline-flex;align-items:center;gap:3px;margin-left:6px;vertical-align:middle;'+
      'font-size:8px;font-weight:900;line-height:1;padding:2px 5px;border-radius:999px;'+
      'border:1px solid var(--bdr);color:'+s.cor+';background:rgba(255,255,255,.75);white-space:nowrap;">'+
      s.icone+' '+s.label+
    '</span>';
  }

  // Em telas largas pode mostrar o detalhe.
  var detalhe = s.detalhe
    ? '<div style="font-size:10px;color:var(--txt2);margin-top:2px;max-width:220px;white-space:normal;">'+s.detalhe+'</div>'
    : '';

  return '<div class="nfce-status-line" title="'+title+'" style="margin-top:4px;display:block;">'+
    '<span class="nfce-badge nfce-'+s.classe+'" style="display:inline-flex;align-items:center;gap:4px;'+
      'font-size:10px;font-weight:900;line-height:1;padding:3px 7px;border-radius:999px;'+
      'border:1px solid var(--bdr);color:'+s.cor+';background:rgba(255,255,255,.7);white-space:nowrap;">'+
      s.icone+' '+s.label+
    '</span>'+
    detalhe+
  '</div>';
}


// ================= BOTÃO NFC-e PENDENTES NO CAIXA =================
function encontrarBotaoNfcePendentes_(){
  var candidatos = Array.prototype.slice.call(document.querySelectorAll('button, a, .btn'));
  return candidatos.find(function(el){
    var txt = String(el.textContent || el.innerText || '').toLowerCase();
    return txt.indexOf('nfc') >= 0 && txt.indexOf('pend') >= 0;
  }) || null;
}

function realocarBotaoNfcePendentesCaixa(){
  var cxData = document.getElementById('cx-d');
  if(!cxData) return;

  var btn = encontrarBotaoNfcePendentes_();

  // Se não encontrar no HTML, cria um botão chamando a função existente, quando existir.
  if(!btn){
    btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '📄 NFC-e pendentes';
    btn.onclick = function(){
      if(typeof abrirNfcePendentes === 'function') return abrirNfcePendentes();
      if(typeof abrirNotasPendentes === 'function') return abrirNotasPendentes();
      if(typeof listarNfcePendentes === 'function') return listarNfcePendentes();
      if(typeof abrirRelatorioNfcePendentes === 'function') return abrirRelatorioNfcePendentes();
      if(typeof toast === 'function') toast('⚠️ Função de NFC-e pendentes não encontrada.');
      else alert('Função de NFC-e pendentes não encontrada.');
    };
  }

  btn.id = btn.id || 'btn-nfce-pendentes-caixa';
  btn.className = (btn.className || 'btn').replace(/\s*btn-nfce-pendentes-caixa/g,'') + ' btn-nfce-pendentes-caixa';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.gap = '6px';
  btn.style.marginLeft = '8px';
  btn.style.whiteSpace = 'nowrap';

  // Usa o mesmo container do campo de data, onde ficam Fechar Caixa e Imprimir.
  var container = cxData.closest('div') || cxData.parentElement;
  while(container && container !== document.body){
    var txt = String(container.textContent || '').toLowerCase();
    if((txt.indexOf('fechar') >= 0 && txt.indexOf('imprimir') >= 0) || container.querySelector('button')){
      break;
    }
    container = container.parentElement;
  }
  if(!container) container = cxData.parentElement || document.body;

  var botoes = Array.prototype.slice.call(container.querySelectorAll('button'));
  var fechar = botoes.find(function(b){
    return String(b.textContent || '').toLowerCase().indexOf('fechar') >= 0;
  });

  if(fechar && fechar.parentElement === container){
    container.insertBefore(btn, fechar);
  }else{
    container.appendChild(btn);
  }
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(realocarBotaoNfcePendentesCaixa, 500);
});


// ================= BACKUP FISCAL NO CORE =================
function obterAppsScriptUrlFiscal_(){
  return String(window.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec").trim();
}

function chamarAppsScriptFiscal_(action, params){
  var url = obterAppsScriptUrlFiscal_();
  if(!url){
    if(typeof toast==='function') toast('⚠️ URL do Apps Script não encontrada.');
    else alert('URL do Apps Script não encontrada.');
    return Promise.reject(new Error('URL do Apps Script não encontrada'));
  }

  params = params || {};
  params.action = action;

  var qs = Object.keys(params).map(function(k){
    return encodeURIComponent(k)+'='+encodeURIComponent(params[k]);
  }).join('&');

  return fetch(url + (url.indexOf('?')>=0 ? '&' : '?') + qs, {
    method:'GET',
    cache:'no-store'
  }).then(function(r){
    return r.json();
  });
}

function backupFiscalAgoraCore(){
  if(!confirm('Gerar backup da planilha fiscal agora?\n\nSerá criada uma cópia da planilha fiscal no Google Drive.')) return;

  if(typeof toast==='function') toast('⏳ Gerando backup fiscal...','info');

  return chamarAppsScriptFiscal_('backupFiscalAgora').then(function(r){
    if(!r || !r.ok){
      throw new Error((r && r.error) || 'Falha ao criar backup fiscal.');
    }

    var msg = '✅ Backup fiscal criado!';
    if(r.nome) msg += '\n\n' + r.nome;
    if(r.url) msg += '\n\n' + r.url;

    if(typeof toast==='function') toast('✅ Backup fiscal criado!','ok');
    alert(msg);
    return r;
  }).catch(function(e){
    if(typeof toast==='function') toast('❌ Erro no backup fiscal.');
    alert('Erro no backup fiscal:\n' + e.message);
  });
}

function restaurarBackupFiscalCore(){
  if(!confirm('Restaurar o ÚLTIMO backup fiscal?\n\nAtenção: isso vai substituir as abas fiscais atuais: NFC-e, XML, configurações e cancelamentos.')) return;
  if(!confirm('Confirma mesmo a restauração fiscal?\n\nUse somente se precisar voltar um backup fiscal.')) return;

  if(typeof pedirSenha === 'function'){
    pedirSenha(function(){ executarRestauracaoBackupFiscalCore_(); });
  }else{
    executarRestauracaoBackupFiscalCore_();
  }
}

function executarRestauracaoBackupFiscalCore_(){
  if(typeof toast==='function') toast('⏳ Restaurando backup fiscal...','info');

  return chamarAppsScriptFiscal_('restaurarUltimoBackupFiscal').then(function(r){
    if(!r || !r.ok){
      throw new Error((r && r.error) || 'Falha ao restaurar backup fiscal.');
    }

    if(typeof toast==='function') toast('✅ Backup fiscal restaurado!','ok');
    alert('✅ Backup fiscal restaurado com sucesso!\n\nOrigem: ' + (r.origemNome || r.backupName || 'último backup fiscal'));
    return r;
  }).catch(function(e){
    if(typeof toast==='function') toast('❌ Erro ao restaurar fiscal.');
    alert('Erro ao restaurar backup fiscal:\n' + e.message);
  });
}

function realocarBotoesBackupFiscalCaixa(){
  var cxData = document.getElementById('cx-d');
  if(!cxData) return;

  var container = cxData.closest('div') || cxData.parentElement;
  while(container && container !== document.body){
    var txt = String(container.textContent || '').toLowerCase();
    if((txt.indexOf('fechar') >= 0 && txt.indexOf('imprimir') >= 0) || container.querySelector('button')){
      break;
    }
    container = container.parentElement;
  }
  if(!container) container = cxData.parentElement || document.body;

  function mkBtn(id, html, cls, fn, title){
    var b = document.getElementById(id);
    if(!b){
      b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.innerHTML = html;
      b.onclick = fn;
      b.title = title || '';
    }
    b.className = cls || 'btn';
    b.style.display = 'inline-flex';
    b.style.alignItems = 'center';
    b.style.justifyContent = 'center';
    b.style.gap = '6px';
    b.style.marginLeft = '8px';
    b.style.whiteSpace = 'nowrap';
    return b;
  }

  var btnBackup = mkBtn(
    'btn-backup-fiscal-caixa',
    '🧾 Backup Fiscal',
    'btn bg btn-backup-fiscal-caixa',
    backupFiscalAgoraCore,
    'Criar backup da planilha fiscal'
  );

  var btnRestore = mkBtn(
    'btn-restaurar-fiscal-caixa',
    '♻️ Restaurar Fiscal',
    'btn bo btn-restaurar-fiscal-caixa',
    restaurarBackupFiscalCore,
    'Restaurar último backup fiscal'
  );

  var botoes = Array.prototype.slice.call(container.querySelectorAll('button'));
  var fechar = botoes.find(function(b){
    return String(b.textContent || '').toLowerCase().indexOf('fechar') >= 0;
  });

  if(fechar && fechar.parentElement === container){
    container.insertBefore(btnBackup, fechar);
    container.insertBefore(btnRestore, fechar);
  }else{
    container.appendChild(btnBackup);
    container.appendChild(btnRestore);
  }
}





// ================= BACKUP FISCAL NO PAINEL DE SINCRONIZAÇÃO =================
function bmAppsScriptUrl_(){
  var urlFixa = "https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec";
  return String(window.APPS_SCRIPT_URL || urlFixa).trim();
}

function bmChamarAppsScript_(action, params){
  params = params || {};
  params.action = action;
  var url = bmAppsScriptUrl_();
  var qs = Object.keys(params).map(function(k){
    return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
  }).join("&");
  return fetch(url + (url.indexOf("?") >= 0 ? "&" : "?") + qs, {
    method: "GET",
    cache: "no-store"
  }).then(function(resp){ return resp.json(); });
}

function backupFiscalAgoraCore(){
  if(!confirm("Gerar backup da planilha fiscal agora?\n\nSerá criada uma cópia da planilha fiscal no Google Drive.")) return;
  if(typeof toast === "function") toast("⏳ Gerando backup fiscal...", "info");
  return bmChamarAppsScript_("backupFiscalAgora").then(function(data){
    if(!data || !data.ok) throw new Error((data && data.error) || "Falha no backup fiscal.");
    if(typeof toast === "function") toast("✅ Backup fiscal criado!", "ok");
    alert("✅ Backup fiscal criado com sucesso!\n\n" + (data.nome || "") + (data.url ? "\n\n" + data.url : ""));
    return data;
  }).catch(function(err){
    if(typeof toast === "function") toast("❌ Erro no backup fiscal.");
    alert("Erro no backup fiscal:\n" + err.message);
  });
}

function restaurarBackupFiscalCore(){
  if(!confirm("Restaurar o ÚLTIMO backup fiscal?\n\nIsso vai substituir XMLs, notas, cancelamentos e configurações fiscais atuais.")) return;
  if(!confirm("Confirma mesmo a restauração fiscal?\n\nUse somente se precisar voltar o fiscal para o último backup.")) return;
  var executar = function(){
    if(typeof toast === "function") toast("⏳ Restaurando backup fiscal...", "info");
    return bmChamarAppsScript_("restaurarUltimoBackupFiscal").then(function(data){
      if(!data || !data.ok) throw new Error((data && data.error) || "Falha ao restaurar backup fiscal.");
      if(typeof toast === "function") toast("✅ Backup fiscal restaurado!", "ok");
      alert("✅ Backup fiscal restaurado com sucesso!\n\nOrigem: " + (data.origemNome || data.backupName || "último backup fiscal"));
      return data;
    }).catch(function(err){
      if(typeof toast === "function") toast("❌ Erro ao restaurar fiscal.");
      alert("Erro ao restaurar backup fiscal:\n" + err.message);
    });
  };
  if(typeof pedirSenha === "function") pedirSenha(executar);
  else executar();
}

function limparBotoesObsoletosBackupXml(){
  try{
    var els = Array.prototype.slice.call(document.querySelectorAll("button, a, .btn"));
    els.forEach(function(el){
      var txt = String(el.textContent || el.innerText || "").toLowerCase().replace(/\s+/g, " ").trim();
      if(txt.indexOf("xml do mês") >= 0 || txt.indexOf("xml do mes") >= 0){
        el.style.display = "none";
        el.setAttribute("data-removido-bm", "xml-mes");
        return;
      }
      if((txt === "fazer backup" || txt.indexOf("fazer backup") >= 0) &&
         txt.indexOf("fiscal") < 0 && txt.indexOf("servidor") < 0 &&
         txt.indexOf("drive") < 0 && txt.indexOf("planilha") < 0){
        el.style.display = "none";
        el.setAttribute("data-removido-bm", "backup-local");
        return;
      }
      if(txt.indexOf("restaurar backup") >= 0 &&
         txt.indexOf("drive") < 0 && txt.indexOf("servidor") < 0 &&
         txt.indexOf("fiscal") < 0 && txt.indexOf("planilha") < 0){
        el.style.display = "none";
        el.setAttribute("data-removido-bm", "restore-local");
        return;
      }
    });
  }catch(e){}
}

function inserirBotoesBackupFiscalNoPainelSync(){
  limparBotoesObsoletosBackupXml();
  if(document.getElementById("btnBackupFiscalSync") && document.getElementById("btnRestaurarFiscalSync")) return;

  var botoes = Array.prototype.slice.call(document.querySelectorAll("button, a, .btn"));
  var ref = botoes.find(function(el){
    var txt = String(el.textContent || el.innerText || "").toLowerCase();
    return txt.indexOf("backup servidor") >= 0 || txt.indexOf("google drive") >= 0;
  }) || botoes.find(function(el){
    var txt = String(el.textContent || el.innerText || "").toLowerCase();
    return txt.indexOf("sincronizar agora") >= 0;
  });
  if(!ref) return;
  var area = ref.parentElement || document.body;

  var btnBackup = document.createElement("button");
  btnBackup.type = "button";
  btnBackup.id = "btnBackupFiscalSync";
  btnBackup.innerHTML = "🟣 Backup fiscal";
  btnBackup.onclick = backupFiscalAgoraCore;
  btnBackup.className = "btn";
  btnBackup.style.margin = "6px";
  btnBackup.style.padding = "10px 14px";
  btnBackup.style.borderRadius = "10px";
  btnBackup.style.border = "none";
  btnBackup.style.background = "#7c3aed";
  btnBackup.style.color = "#fff";
  btnBackup.style.fontWeight = "bold";
  btnBackup.style.cursor = "pointer";

  var btnRestore = document.createElement("button");
  btnRestore.type = "button";
  btnRestore.id = "btnRestaurarFiscalSync";
  btnRestore.innerHTML = "🔴 Restaurar backup fiscal";
  btnRestore.onclick = restaurarBackupFiscalCore;
  btnRestore.className = "btn";
  btnRestore.style.margin = "6px";
  btnRestore.style.padding = "10px 14px";
  btnRestore.style.borderRadius = "10px";
  btnRestore.style.border = "none";
  btnRestore.style.background = "#dc2626";
  btnRestore.style.color = "#fff";
  btnRestore.style.fontWeight = "bold";
  btnRestore.style.cursor = "pointer";
  area.appendChild(btnBackup);
  area.appendChild(btnRestore);
}

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(limparBotoesObsoletosBackupXml, 400);
  setTimeout(inserirBotoesBackupFiscalNoPainelSync, 900);
  setTimeout(inserirBotoesBackupFiscalNoPainelSync, 1600);
});

function renderCaixa(){
  setTimeout(function(){ limparBotoesObsoletosBackupXml(); inserirBotoesBackupFiscalNoPainelSync(); }, 120); // ajuste-backup-renderCaixa
  var data=document.getElementById('cx-d').value; if(!data)return;
  var vendas=DB.get('vendas').filter(function(v){return v.data.startsWith(data);});
  var pgs=DB.get('pagamentos').filter(function(p){return p.data.startsWith(data);});
  var vendaVista=vendas.filter(function(v){return v.forma!=='fiado';});
  var vendaCred=vendas.filter(function(v){return v.forma==='fiado';});
  var tvista=vendaVista.reduce(function(s,v){return s+v.total;},0);
  var tfiado=vendaCred.reduce(function(s,v){return s+v.total;},0);
  var trec=pgs.reduce(function(s,p){return s+p.val;},0);

  // Cards clicáveis
  document.getElementById('cx-st').innerHTML=
    '<div class="st stg" onclick="verVendasCaixa(\'vista\')" style="cursor:pointer;" title="Ver vendas à vista">'+
      '<div class="sl">Vendas Vista</div><div class="sv">'+R(tvista)+'</div>'+
      '<span style="font-size:12px;color:var(--txt2)">'+vendaVista.length+' venda(s) 🔍</span></div>'+
    '<div class="st stb">'+
      '<div class="sl">Receb. Crediário</div><div class="sv">'+R(trec)+'</div></div>'+
    '<div class="st str" onclick="verVendasCaixa(\'cred\')" style="cursor:pointer;" title="Ver crediários">'+
      '<div class="sl">Novo Crediário</div><div class="sv">'+R(tfiado)+'</div>'+
      '<span style="font-size:12px;color:var(--txt2)">'+vendaCred.length+' venda(s) 🔍</span></div>'+
    '<div class="st stgo">'+
      '<div class="sl">Total Caixa</div><div class="sv">'+R(tvista+trec)+'</div></div>';

  // Tabela por forma de pagamento
  var fV={}, fR={};
  vendaVista.forEach(function(v){pagamentosVendaLista(v).forEach(function(pg){fV[pg.forma]=(fV[pg.forma]||0)+pg.valor;});});
  pgs.forEach(function(p){fR[p.forma]=(fR[p.forma]||0)+p.val;});
  var todas=Object.keys(Object.assign({},fV,fR));
  var tbl='<table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="background:var(--s2)"><th style="padding:9px;text-align:left">Forma</th><th style="padding:9px;text-align:right">Vendas</th><th style="padding:9px;text-align:right">Recebimentos</th><th style="padding:9px;text-align:right;color:var(--gold)">Total</th></tr></thead><tbody>';
  todas.forEach(function(f){var vv=fV[f]||0,rv=fR[f]||0;
    tbl+='<tr><td style="padding:9px;border-bottom:1px solid var(--bdr)">'+FF(f)+'</td>'+
      '<td style="padding:9px;border-bottom:1px solid var(--bdr);text-align:right;color:var(--green)">'+R(vv)+'</td>'+
      '<td style="padding:9px;border-bottom:1px solid var(--bdr);text-align:right;color:var(--blue)">'+R(rv)+'</td>'+
      '<td style="padding:9px;border-bottom:1px solid var(--bdr);text-align:right;font-weight:800;color:var(--gold)">'+R(vv+rv)+'</td></tr>';
  });
  if(tfiado>0)tbl+='<tr><td style="padding:9px;border-bottom:1px solid var(--bdr)">📋 Crediário (novo)</td>'+
    '<td style="padding:9px;text-align:right;border-bottom:1px solid var(--bdr);color:var(--red2)">'+R(tfiado)+'</td>'+
    '<td style="padding:9px;text-align:right;border-bottom:1px solid var(--bdr)">—</td>'+
    '<td style="padding:9px;text-align:right;font-weight:800;color:var(--red2);border-bottom:1px solid var(--bdr)">'+R(tfiado)+'</td></tr>';
  tbl+='<tr style="background:var(--s2)"><td style="padding:9px;font-weight:800">TOTAL</td>'+
    '<td style="padding:9px;text-align:right;font-weight:800;color:var(--green)">'+R(tvista)+'</td>'+
    '<td style="padding:9px;text-align:right;font-weight:800;color:var(--blue)">'+R(trec)+'</td>'+
    '<td style="padding:9px;text-align:right;font-weight:800;color:var(--gold)">'+R(tvista+trec)+'</td></tr>';
  tbl+='</tbody></table>';
  document.getElementById('cx-f').innerHTML=todas.length?tbl:'<div style="text-align:center;padding:20px;color:var(--txt2)">Sem movimentações</div>';

  // Movimentações com botões editar/cancelar
  var movs=vendas.map(function(v){
    return {d:v.data,desc:'Venda — '+v.cliNome,val:v.total,t:v.forma==='fiado'?'f':'v',f:v.forma,sid:v.id,tipo:'venda'};
  }).concat(pgs.map(function(p){
    var c=DB.get('clientes').find(function(x){return x.id===p.cid;})||{nome:'?'};
    return {d:p.data,desc:'Recebimento — '+c.nome,val:p.val,t:'p',f:p.forma,sid:p.id,tipo:'pag'};
  })).sort(function(a,b){return new Date(b.d)-new Date(a.d);});

  document.getElementById('cx-m').innerHTML=movs.length?movs.map(function(m){
    var cor=m.t==='f'?'var(--red2)':m.t==='p'?'var(--blue)':'var(--gold)';
    var btns='<span class="caixa-btn-grid" style="display:grid;grid-template-columns:repeat(4,46px);gap:5px;justify-content:end;align-items:center;flex-shrink:0;">';
    if(m.tipo==='venda'){
      var vx=(DB.get('vendas')||[]).find(function(v){ return String(v.id)===String(m.sid); })||{};
      btns+='<button class="btn bh xs" onclick="abrirVdet(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Ver/Editar">🔍</button>';
      btns+='<button class="btn bg2 xs" onclick="emitirNfceCaixa(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Emitir NFC-e">📄</button>';
      if(vx.nfce_pdf_url){
        btns+='<button class="btn bb xs" onclick="abrirNotaPdf(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Abrir PDF da nota">PDF</button>';
      }
      if(vx.nfce_xml_url){
        btns+='<button class="btn bo xs" onclick="abrirNotaXml(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Abrir XML da nota">XML</button>';
      }
      var nfceStatus=String(vx.nfce_status||'').toLowerCase();
      var temNfce=!!(vx.nfce_numero||vx.nfce_chave||vx.nfce_xml_url||vx.nfce_pdf_url);
      if(temNfce && nfceStatus.indexOf('cancel')<0){
        btns+='<button class="btn bd2 xs nfce-cancel-btn" onclick="cancelarNfceCaixa(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Cancelar NFC-e na SEFAZ">NFC-e 🚫</button>';
      }
      btns+='<button class="btn bd2 xs" onclick="pedirSenhaECancelar(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Cancelar venda no caixa">🚫</button>';
      btns+='<button class="btn bh xs" onclick="reimprimirMovCaixa(\''+m.sid+'\',\''+m.tipo+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Reimprimir comprovante">🖨️</button>';
      btns+='<button class="btn bo xs" onclick="reenviarMovWhatsappCaixa(\''+m.sid+'\',\''+m.tipo+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Reenviar no WhatsApp">📱</button>';
    }
    if(m.tipo==='pag'){
      btns+='<button class="btn bh xs" onclick="editarRecebCaixa(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Corrigir recebimento">✏️</button>';
      btns+='<button class="btn bd2 xs" onclick="excluirRecebCaixa(\''+m.sid+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Excluir recebimento">🗑️</button>';
      btns+='<button class="btn bh xs" onclick="reimprimirMovCaixa(\''+m.sid+'\',\''+m.tipo+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Reimprimir recibo">🖨️</button>';
      btns+='<button class="btn bo xs" onclick="reenviarMovWhatsappCaixa(\''+m.sid+'\',\''+m.tipo+'\')" style="padding:3px 4px;font-size:11px;min-width:46px;height:34px;display:inline-flex;align-items:center;justify-content:center;" title="Reenviar no WhatsApp">📱</button>';
    }
    btns+='</span>';
    return '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bdr);gap:8px;">'+
      '<div style="flex:1;min-width:0;">'+
        '<b style="font-size:14px;">'+m.desc+'</b><br>'+
        '<span style="color:var(--txt2);font-size:12px;">'+
          new Date(m.d).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · '+FF(m.f)+
          (m.tipo==='venda'?nfceBadgeHTML((DB.get('vendas')||[]).find(function(v){return String(v.id)===String(m.sid);})||{}, true):'')+
        '</span>'+
      '</div>'+
      '<span style="font-weight:800;color:'+cor+';font-size:15px;flex:0 0 78px;text-align:right;">'+R(m.val)+'</span>'+
      btns+
    '</div>';
  }).join(''):'<div style="text-align:center;padding:20px;color:var(--txt2)">Sem movimentações</div>';
  setTimeout(realocarBotaoNfcePendentesCaixa, 50);
 
}


function fecharCaixaDia(){
  var dataEl=document.getElementById('cx-d');
  var data = dataEl && dataEl.value ? dataEl.value : '';
  var msg = 'Tem certeza que deseja fazer o fechamento do caixa agora?';
  if(data) msg += '\n\nData do caixa: ' + data;
  msg += '\n\nAo confirmar, o sistema vai gerar o backup automaticamente.';
  if(!confirm(msg)) return;

  try{
    exportarBackup();
    if(typeof backupNowServidor==='function'){
      setTimeout(function(){ try{ backupNowServidor(); }catch(e){} }, 400);
    }
    if(typeof toast==='function'){
      toast('✅ Fechamento iniciado! Backup gerado.','ok');
    }else{
      alert('Fechamento realizado e backup gerado.');
    }
  }catch(e){
    if(typeof toast==='function') toast('❌ Erro ao fechar caixa!');
    else alert('Erro ao fechar caixa');
  }
}

function printCaixa(){
  var data=document.getElementById('cx-d').value;
  var vendas=DB.get('vendas').filter(function(v){return v.data.startsWith(data);});
  var total=vendas.reduce(function(s,v){return s+v.total;},0);
  document.getElementById('pz').innerHTML='<h2 style="text-align:center;">Bela Modas — Caixa do Dia</h2><p style="text-align:center;color:#666;margin-bottom:12px;">'+new Date(data+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</p><hr style="margin-bottom:10px;">'+
    vendas.map(function(v){return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:13px;"><span>'+v.cliNome+' · '+textoPagamentosVenda(v)+'</span><span>'+R(v.total)+'</span></div>';}).join('')+
    '<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:17px;font-weight:800;"><span>TOTAL</span><span style="color:#c0392b;">'+R(total)+'</span></div>';
  window.print();
}

function editarRecebCaixa(pid){
  pedirSenha(function(){
    var pgs=DB.get('pagamentos');
    var idx=pgs.findIndex(function(x){return x.id===pid;});
    if(idx<0){toast('⚠️ Recebimento não encontrado!');return;}
    var pag=pgs[idx];
    var cli=DB.get('clientes').find(function(x){return x.id===pag.cid;})||{nome:'Cliente'};
    var novoValor=prompt('Corrigir valor recebido de '+cli.nome, Number(pag.val||0).toFixed(2).replace('.',','));
    if(novoValor===null)return;
    novoValor=String(novoValor).replace(',', '.').trim();
    var valor=parseFloat(novoValor);
    if(!valor || valor<=0){toast('⚠️ Valor inválido!');return;}
    var formaAtual=pag.forma||'dinheiro';
    var novaForma=prompt('Forma de pagamento (dinheiro, pix, cartão, transferência)', formaAtual);
    if(novaForma===null)return;
    novaForma=String(novaForma).trim().toLowerCase();
    if(!novaForma)novaForma=formaAtual;
    pag.val=valor;
    pag.forma=novaForma;
    pgs[idx]=pag;
    DB.set('pagamentos', pgs);
    renderCaixa();
    renderReceb();
    if(typeof renderDash==='function')renderDash();
    toast('✅ Recebimento corrigido!','ok');
  });
}

function excluirRecebCaixa(pid){
  pedirSenha(function(){
    var pgs=DB.get('pagamentos');
    var pag=pgs.find(function(x){return x.id===pid;});
    if(!pag){toast('⚠️ Recebimento não encontrado!');return;}
    var cli=DB.get('clientes').find(function(x){return x.id===pag.cid;})||{nome:'Cliente'};
    if(!confirm('Excluir recebimento de '+R(pag.val)+' do cliente '+cli.nome+'?\nEsta ação não pode ser desfeita!'))return;
    registrarDeletedStore('pagamentos', pag);
    DB.set('pagamentos', pgs.filter(function(x){return x.id!==pid;}));
    renderCaixa();
    renderReceb();
    if(typeof renderDash==='function')renderDash();
    toast('🗑️ Recebimento excluído!','ok');
  });
}

// RELATÓRIO
function trocarAbaRelatorio(aba){
  var tabs=['mensal','categorias','estoque'];
  tabs.forEach(function(nome){
    var tab=document.getElementById('rl-tab-'+nome);
    var panel=document.getElementById('rl-panel-'+nome);
    if(tab) tab.classList.toggle('on', nome===aba);
    if(panel) panel.classList.toggle('on', nome===aba);
    if(panel) panel.style.display = nome===aba ? 'block' : 'none';
  });
}

function renderRel(){
  setTimeout(function(){ limparBotoesObsoletosBackupXml(); inserirBotoesBackupFiscalNoPainelSync(); }, 120); // ajuste-backup-renderRel
  var mes=parseInt(document.getElementById('rl-m').value),ano=parseInt(document.getElementById('rl-a').value);
  if(isNaN(ano))return;
  var vendas=DB.get('vendas').filter(function(v){var d=new Date(v.data);return d.getMonth()===mes&&d.getFullYear()===ano;});
  var pgs=DB.get('pagamentos').filter(function(p){var d=new Date(p.data);return d.getMonth()===mes&&d.getFullYear()===ano;});
  var tvista=vendas.filter(function(v){return v.forma!=='fiado';}).reduce(function(s,v){return s+v.total;},0);
  var tfiado=vendas.filter(function(v){return v.forma==='fiado';}).reduce(function(s,v){return s+v.total;},0);
  var trec=pgs.reduce(function(s,p){return s+p.val;},0);

  document.getElementById('rl-st').innerHTML=
    '<div class="st stg"><div class="sl">Vendas Vista</div><div class="sv">'+R(tvista)+'</div><span style="font-size:12px;color:var(--txt2)">'+vendas.filter(function(v){return v.forma!=='fiado';}).length+' vendas</span></div>'+
    '<div class="st str"><div class="sl">Crediário Gerado</div><div class="sv">'+R(tfiado)+'</div></div>'+
    '<div class="st stb"><div class="sl">Recebimentos</div><div class="sv">'+R(trec)+'</div></div>'+
    '<div class="st stgo"><div class="sl">Receita Total</div><div class="sv">'+R(tvista+trec)+'</div></div>';

  var formas={};
  vendas.filter(function(v){return v.forma!=='fiado';}).forEach(function(v){pagamentosVendaLista(v).forEach(function(pg){formas[pg.forma]=(formas[pg.forma]||0)+pg.valor;});});
  document.getElementById('rl-f').innerHTML=Object.entries(formas).map(function(e){
    return '<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--bdr);font-size:14px;"><span>'+FF(e[0])+'</span><span style="color:var(--gold);font-weight:800;">'+R(e[1])+'</span></div>';
  }).join('')||'<div style="text-align:center;padding:16px;color:var(--txt2)">Sem dados</div>';

  var prods=DB.get('produtos');
  var grupos={};
  var subcats={};
  var ico={CALÇADOS:'👠',ROUPAS:'👗','ACESSÓRIOS':'👜',OUTROS:'🛍️'};
  var cores={CALÇADOS:'#1a5276',ROUPAS:'#c0392b','ACESSÓRIOS':'#b8860b',OUTROS:'#7f8c8d'};

  vendas.forEach(function(v){
    (v.itens||[]).forEach(function(i){
      var p=prods.find(function(x){return x.id===i.pid||x.nome===i.desc;})||{};
      var textoItem=(i.desc||i.nome||i.cat||'');
      var temCadastro=!!(p && (p.id||p.nome));
      var subcat=(temCadastro ? (p.subcategoria||p.subcat||p.cat||'') : '') || i.cat || inferSubcategoriaPorTexto(textoItem) || textoItem || 'Outros';
      var grupo=(temCadastro ? (p.grupo||categoriaPrincipalPorSubcategoria(subcat)||'') : '') || inferCategoriaPorTexto(textoItem) || categoriaPrincipalPorSubcategoria(subcat) || 'OUTROS';
      var qtd=(Number(i.qty)||0);
      var totalItem=(Number(i.preco)||0)*qtd;
      if(!grupos[grupo])grupos[grupo]={total:0,qty:0};
      if(!subcats[subcat])subcats[subcat]={grupo:grupo,total:0,qty:0};
      grupos[grupo].total+=totalItem;
      grupos[grupo].qty+=qtd;
      subcats[subcat].total+=totalItem;
      subcats[subcat].qty+=qtd;
    });
  });

  var gruposOrdenados=Object.entries(grupos).sort(function(a,b){return b[1].total-a[1].total;});
  var subcatsOrdenadas=Object.entries(subcats).sort(function(a,b){return b[1].total-a[1].total;});

  document.getElementById('rl-p').innerHTML=subcatsOrdenadas.length?subcatsOrdenadas.slice(0,10).map(function(e){
    return '<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--bdr);font-size:14px;">'+
      '<span><b>'+e[0]+'</b><br><span class="tm">'+e[1].qty+' un. • '+e[1].grupo+'</span></span>'+
      '<span style="color:var(--gold);font-weight:800;white-space:nowrap;">'+R(e[1].total)+'</span></div>';
  }).join(''):'<div style="text-align:center;padding:16px;color:var(--txt2)">Sem vendas</div>';

  var totalCategorias=gruposOrdenados.reduce(function(s,e){return s+e[1].total;},0);
  var gradiente=gruposOrdenados.length?gruposOrdenados.map(function(e,idx,arr){
    var ini=arr.slice(0,idx).reduce(function(s,x){return s+x[1].total;},0);
    var fim=ini+e[1].total;
    var p1=totalCategorias?((ini/totalCategorias)*100):0;
    var p2=totalCategorias?((fim/totalCategorias)*100):0;
    return (cores[e[0]]||'#7f8c8d')+' '+p1+'% '+p2+'%';
  }).join(', '):'#dcdce4 0 100%';

  var resumoHTML=gruposOrdenados.length?
    '<div class="tw"><table><thead><tr><th>Categoria</th><th>Qtd</th><th>%</th><th>Total</th></tr></thead><tbody>'+
    gruposOrdenados.map(function(e){
      var pct=totalCategorias?((e[1].total/totalCategorias)*100):0;
      return '<tr><td><b>'+(ico[e[0]]||'🛍️')+' '+e[0]+'</b></td><td style="text-align:center">'+e[1].qty+'</td><td style="text-align:center">'+pct.toFixed(1).replace('.',',')+'%</td><td style="text-align:right;font-weight:800;color:var(--gold)">'+R(e[1].total)+'</td></tr>';
    }).join('')+
    '</tbody></table></div>':
    '<div style="text-align:center;padding:16px;color:var(--txt2)">Sem vendas</div>';

  var legendasHTML=gruposOrdenados.map(function(e){
    var pct=totalCategorias?((e[1].total/totalCategorias)*100):0;
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--bdr);">'+
      '<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+(cores[e[0]]||'#7f8c8d')+';"></span><b>'+(ico[e[0]]||'🛍️')+' '+e[0]+'</b></div>'+
      '<div style="text-align:right;"><div style="font-weight:800;color:var(--gold)">'+R(e[1].total)+'</div><div class="tm">'+pct.toFixed(1).replace('.',',')+'% • '+e[1].qty+' un.</div></div></div>';
  }).join('');

  document.getElementById('rl-cat-chart').innerHTML=gruposOrdenados.length?
    '<div style="display:flex;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap;">'+
      '<div style="width:220px;height:220px;border-radius:50%;background:conic-gradient('+gradiente+');position:relative;flex:0 0 auto;">'+
        '<div style="position:absolute;inset:28px;background:var(--s1);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;font-weight:800;color:var(--txt);line-height:1.25;">'+
          '<div><div style="font-size:11px;color:var(--txt2);text-transform:uppercase;">Total vendido</div><div style="font-family:Playfair Display,serif;font-size:24px;color:var(--red2);">'+R(totalCategorias)+'</div></div>'+
        '</div>'+
      '</div>'+
      '<div style="flex:1;min-width:220px;">'+legendasHTML+'</div>'+
    '</div>':
    '<div style="text-align:center;padding:16px;color:var(--txt2)">Sem vendas</div>';

  document.getElementById('rl-cat-resumo').innerHTML=resumoHTML;
  document.getElementById('rl-subcats').innerHTML=subcatsOrdenadas.length?
    '<div class="tw"><table><thead><tr><th>Subcategoria</th><th>Categoria</th><th>Qtd</th><th>Total</th></tr></thead><tbody>'+
    subcatsOrdenadas.map(function(e){
      return '<tr><td><b>'+e[0]+'</b></td><td>'+(ico[e[1].grupo]||'🛍️')+' '+e[1].grupo+'</td><td style="text-align:center">'+e[1].qty+'</td><td style="text-align:right;font-weight:800;color:var(--gold)">'+R(e[1].total)+'</td></tr>';
    }).join('')+
    '</tbody></table></div>':
    '<div style="text-align:center;padding:16px;color:var(--txt2)">Sem vendas</div>';

  var rows=vendas.slice().sort(function(a,b){return new Date(b.data)-new Date(a.data);}).map(function(v){
    return '<tr><td>'+FD(v.data)+'</td><td>'+v.cliNome+'</td><td style="font-size:12px;">'+v.itens.map(function(i){return i.desc+' x'+i.qty;}).join(', ')+'</td><td>'+textoPagamentosVenda(v)+'</td><td style="color:var(--gold);font-weight:800;">'+R(v.total)+'</td></tr>';
  }).join('');
  document.getElementById('rl-tb').innerHTML=rows||'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--txt2)">Sem vendas</td></tr>';
  renderRelEstoque();
}

function parseNumRelEstoque(v){
  if(v==null || v==='') return 0;
  if(typeof v==='number') return Number.isFinite(v)?v:0;
  var s=String(v).trim()
    .replace(/R\$/gi,'')
    .replace(/\s/g,'')
    .replace(/\./g,'')
    .replace(',', '.');
  var n=Number(s);
  return Number.isFinite(n)?n:0;
}

function produtoSemCustoCadastrado_(p){
  var c = p && p.custo;
  if(c==null) return true;
  var s = String(c).trim();
  if(!s) return true;
  return parseNumRelEstoque(c) <= 0;
}

function statusFiscalRelEstoque_(p){
  var status = String((p && p.origem_fiscal_status) || '').toLowerCase();
  if(status) return status;
  return classificarOrigemFiscalProdutoApp(p || {});
}

function renderRelCoberturaFiscalEstoque(itens){
  var resumo = {bela_modas:{pecas:0,valor:0}, outro_cnpj:{pecas:0,valor:0}, xml_sem_cnpj:{pecas:0,valor:0}, sem_nota:{pecas:0,valor:0}};
  var porCategoria = {};
  var totalPecas = 0, totalValor = 0;

  (itens||[]).forEach(function(x){
    if(!x || x.est <= 0) return;
    var status = statusFiscalRelEstoque_(x.p);
    if(!resumo[status]) status = 'sem_nota';
    var valor = Number(x.entrada || x.venda || 0);
    resumo[status].pecas += x.est;
    resumo[status].valor += valor;
    totalPecas += x.est;
    totalValor += valor;

    var grupo = x.grupo || 'OUTROS';
    if(!porCategoria[grupo]) porCategoria[grupo] = {pecas:0, valor:0, bela_modas:0, outro_cnpj:0, xml_sem_cnpj:0, sem_nota:0};
    porCategoria[grupo].pecas += x.est;
    porCategoria[grupo].valor += valor;
    porCategoria[grupo][status] += x.est;
  });

  var coberturaPecas = totalPecas ? (resumo.bela_modas.pecas / totalPecas * 100) : 0;
  var coberturaAmpla = totalPecas ? ((resumo.bela_modas.pecas + resumo.outro_cnpj.pecas + resumo.xml_sem_cnpj.pecas) / totalPecas * 100) : 0;
  var st = document.getElementById('rl-fiscal-st');
  if(st) st.innerHTML =
    '<div class="st stg"><div class="sl">Cobertura Bela Modas</div><div class="sv">'+coberturaPecas.toFixed(1).replace('.',',')+'%</div><span class="tm">'+resumo.bela_modas.pecas+' peça(s) no CNPJ correto</span></div>'+
    '<div class="st stgo"><div class="sl">Outro CNPJ</div><div class="sv">'+resumo.outro_cnpj.pecas+'</div><span class="tm">'+R(resumo.outro_cnpj.valor)+'</span></div>'+
    '<div class="st stb"><div class="sl">XML sem CNPJ</div><div class="sv">'+resumo.xml_sem_cnpj.pecas+'</div><span class="tm">'+R(resumo.xml_sem_cnpj.valor)+'</span></div>'+
    '<div class="st str"><div class="sl">Sem nota</div><div class="sv">'+resumo.sem_nota.pecas+'</div><span class="tm">'+R(resumo.sem_nota.valor)+'</span></div>'+
    '<div class="st sto"><div class="sl">Cobertura ampla</div><div class="sv">'+coberturaAmpla.toFixed(1).replace('.',',')+'%</div><span class="tm">Inclui qualquer XML</span></div>';

  var rows = Object.entries(porCategoria).sort(function(a,b){return b[1].valor-a[1].valor;}).map(function(e){
    var d=e[1];
    var pct=d.pecas ? (d.bela_modas/d.pecas*100) : 0;
    return '<tr>'+
      '<td><b>'+esc(e[0])+'</b></td>'+
      '<td style="text-align:center">'+d.pecas+'</td>'+
      '<td style="text-align:center;color:var(--green);font-weight:800">'+d.bela_modas+'</td>'+
      '<td style="text-align:center;color:var(--gold);font-weight:800">'+d.outro_cnpj+'</td>'+
      '<td style="text-align:center;color:var(--blue);font-weight:800">'+d.xml_sem_cnpj+'</td>'+
      '<td style="text-align:center;color:var(--red2);font-weight:800">'+d.sem_nota+'</td>'+
      '<td style="text-align:right;font-weight:800">'+pct.toFixed(1).replace('.',',')+'%</td>'+
    '</tr>';
  }).join('');

  var cat = document.getElementById('rl-fiscal-cat');
  if(cat) cat.innerHTML = rows ?
    '<div class="tw"><table><thead><tr><th>Categoria</th><th>Peças</th><th>Bela Modas</th><th>Outro CNPJ</th><th>XML sem CNPJ</th><th>Sem nota</th><th>% Bela Modas</th></tr></thead><tbody>'+rows+'</tbody></table></div>' :
    '<div class="empty">Sem estoque positivo para classificar</div>';
}

function renderRelEstoque(){
  var prods=DB.get('produtos')||[];
  var itens=prods.map(function(p){
    var est=parseNumRelEstoque(p.estoque!=null?p.estoque:p.estq);
    var preco=parseNumRelEstoque(p.preco);
    var custo=parseNumRelEstoque(p.custo);
    var venda=est*preco;
    var entrada=est*custo;
    var lucro=venda-entrada;
    var margem=venda>0?(lucro/venda*100):0;
    var subcat=p.subcategoria||p.subcat||p.cat||'Outros';
    var grupo=p.grupo||categoriaPrincipalPorSubcategoria(subcat)||inferCategoriaPorTexto(p.nome||'')||'OUTROS';
    return {p:p, est:est, preco:preco, custo:custo, venda:venda, entrada:entrada, lucro:lucro, margem:margem, grupo:grupo, subcat:subcat};
  });
  var totalProdutos=prods.length;
  var totalPecas=itens.reduce(function(s,x){return s+x.est;},0);
  var valorVenda=itens.reduce(function(s,x){return s+x.venda;},0);
  var valorEntrada=itens.reduce(function(s,x){return s+x.entrada;},0);
  var lucro=valorVenda-valorEntrada;
  var margemMedia=valorVenda>0?(lucro/valorVenda*100):0;
  var st=document.getElementById('rl-est-st');
  if(st) st.innerHTML=
    '<div class="st stb"><div class="sl">Produtos cadastrados</div><div class="sv">'+totalProdutos+'</div></div>'+
    '<div class="st stgo"><div class="sl">Peças em estoque</div><div class="sv">'+totalPecas+'</div></div>'+
    '<div class="st stg"><div class="sl">Valor venda estoque</div><div class="sv">'+R(valorVenda)+'</div></div>'+
    '<div class="st sto"><div class="sl">Valor entrada/custo</div><div class="sv">'+R(valorEntrada)+'</div></div>'+
    '<div class="st str"><div class="sl">Lucro estimado</div><div class="sv">'+R(lucro)+'</div><span class="tm">Margem média: '+margemMedia.toFixed(1).replace('.',',')+'%</span></div>';

  renderRelCoberturaFiscalEstoque(itens);

  var grupos={};
  itens.forEach(function(x){
    if(!grupos[x.grupo]) grupos[x.grupo]={pecas:0,venda:0,entrada:0,lucro:0};
    grupos[x.grupo].pecas+=x.est;
    grupos[x.grupo].venda+=x.venda;
    grupos[x.grupo].entrada+=x.entrada;
    grupos[x.grupo].lucro+=x.lucro;
  });
  var catRows=Object.entries(grupos).sort(function(a,b){return b[1].venda-a[1].venda;}).map(function(e){
    var m=e[1].venda>0?(e[1].lucro/e[1].venda*100):0;
    return '<tr><td><b>'+e[0]+'</b></td><td style="text-align:center">'+e[1].pecas+'</td><td style="text-align:right">'+R(e[1].entrada)+'</td><td style="text-align:right;color:var(--gold);font-weight:800">'+R(e[1].venda)+'</td><td style="text-align:right">'+m.toFixed(1).replace('.',',')+'%</td></tr>';
  }).join('');
  var cat=document.getElementById('rl-est-cat');
  if(cat) cat.innerHTML=catRows?'<div class="tw"><table><thead><tr><th>Categoria</th><th>Peças</th><th>Custo</th><th>Venda</th><th>Margem</th></tr></thead><tbody>'+catRows+'</tbody></table></div>':'<div class="empty">Sem produtos cadastrados</div>';

  var semCustoTotal=itens.filter(function(x){return produtoSemCustoCadastrado_(x.p);}).length;
  var semCustoEstoque=itens.filter(function(x){return x.est>0 && produtoSemCustoCadastrado_(x.p);}).length;
  var estoqueZero=itens.filter(function(x){return x.est<=0;}).length;
  var margemBaixa=itens.filter(function(x){return x.est>0 && x.venda>0 && x.custo>0 && x.margem<30;}).length;
  var alertas=document.getElementById('rl-est-alertas');
  if(alertas) alertas.innerHTML=
    '<div style="padding:9px 0;border-bottom:1px solid var(--bdr);"><b>Produtos sem custo cadastrados:</b> <span class="txt-o">'+semCustoTotal+'</span></div>'+
    '<div style="padding:9px 0;border-bottom:1px solid var(--bdr);"><b>Produtos sem custo com estoque:</b> <span class="txt-o">'+semCustoEstoque+'</span></div>'+
    '<div style="padding:9px 0;border-bottom:1px solid var(--bdr);"><b>Produtos com estoque zerado:</b> <span class="txt-r">'+estoqueZero+'</span></div>'+
    '<div style="padding:9px 0;"><b>Produtos com margem abaixo de 30%:</b> <span class="txt-o">'+margemBaixa+'</span></div>'+
    '<div class="tm" style="margin-top:10px;line-height:1.4;">Agora o relatório separa produtos sem custo cadastrados de produtos sem custo que ainda têm estoque positivo.</div>';

  var prodRows=itens.filter(function(x){return x.est>0;}).sort(function(a,b){return b.venda-a.venda;}).slice(0,200).map(function(x){
    var statusFiscal = statusFiscalRelEstoque_(x.p);
    return '<tr><td><b>'+esc(x.p.nome||'')+'</b><br><span class="tm">'+esc(x.p.cod||x.p.ean||'')+'</span></td><td>'+esc(x.grupo)+'<br><span class="tm">'+esc(x.subcat)+'</span></td><td><b style="color:'+corOrigemFiscalProdutoApp(statusFiscal)+'">'+rotuloOrigemFiscalProdutoApp(statusFiscal)+'</b></td><td style="text-align:center">'+x.est+'</td><td style="text-align:right">'+R(x.entrada)+'</td><td style="text-align:right;color:var(--gold);font-weight:800">'+R(x.venda)+'</td><td style="text-align:right">'+x.margem.toFixed(1).replace('.',',')+'%</td></tr>';
  }).join('');
  var tb=document.getElementById('rl-est-prod');
  if(tb) tb.innerHTML=prodRows||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--txt2)">Sem estoque positivo</td></tr>';
}

// INIT
window.addEventListener('load', function(){
  carregarTema();

  initDB(); limparDebitosOrfaos();
  document.getElementById('logo').src='logo.png';
  document.getElementById('cx-d').value=todayLocalISO();
  var n=new Date();
  document.getElementById('rl-m').value=n.getMonth();
  var sa=document.getElementById('rl-a');
  for(var y=n.getFullYear();y>=n.getFullYear()-4;y--)sa.innerHTML+='<option value="'+y+'">'+y+'</option>';
  sa.value=n.getFullYear();
  ir('dash');

  // Preencher ano do crediário
  var cra=document.getElementById('cr-a');
  if(cra){var n2=new Date();for(var y2=n2.getFullYear();y2>=n2.getFullYear()-4;y2--)cra.innerHTML+='<option value="'+y2+'">'+y2+'</option>';cra.value=new Date().getFullYear();}
  var crm=document.getElementById('cr-m');if(crm)crm.value=new Date().getMonth();
  // Restaurar tema
  carregarTema();
  syncDown();
  // Encerrar caixa 23:59
  (function agendar(){
    var n=new Date(), ms=new Date(n.getFullYear(),n.getMonth(),n.getDate(),23,59,0)-n;
    if(ms<0)ms+=864e5;
    setTimeout(function(){toast('🔒 Caixa encerrado automaticamente','warn');agendar();}, ms);
  })();
});




// ── CONFIGURAÇÕES ──
var TEMAS_NOMES={escuro:'Escuro',claro:'Cinza Claro',branco:'Branco',rosa:'Rosa',vinho:'Vinho',preto:'Preto'};

var MSG_COB_PAD='Olá, {nome}! 😊\n\nAqui é a *Bela Modas*! 👗\n\nPassando para lembrar que você tem um saldo de crediário em aberto de *{valor}* há {dias} dia(s).\n\nQuando puder, entre em contato para regularizarmos! 💕\n\n📞 31 99733-7304\n📍 @bela_modaspetro';
var MSG_REC_PAD='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Comprovante de Venda*\nData: {data}\n\n{itens}\n\n💰 *Total: {total}*\nPagamento: {forma}\n\nObrigada! 💕\n📞 31 99733-7304';
var MSG_EXT_PAD='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n📋 *Extrato de Crediário*\n💸 Total em crediário: {total_cred}\n✅ Total pago: {total_pago}\n📌 *Saldo: {saldo}*\n\nObrigada! 💕\n📞 31 99733-7304';

function setCfg(k,v){localStorage.setItem('bm_cfg_'+k,v);}

function initConfig(){
  ['cfg-s-atual','cfg-s-nova','cfg-s-conf'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var err=document.getElementById('cfg-s-erro');
  if(err){err.style.display='none'; err.textContent='';}
  // Destacar tema atual
  var t=getCfg('tema','vinho');
  document.querySelectorAll('.tema-card').forEach(function(c){
    c.style.outline='none'; c.style.transform='scale(1)';
  });
  var sel=document.querySelector('[data-tema="'+t+'"]');
  if(sel){sel.style.outline='3px solid #c0392b'; sel.style.transform='scale(1.06)';}
  var tn=document.getElementById('tema-atual-nome');
  var nomes={vinho:'Vinho',escuro:'Escuro',claro:'Cinza',branco:'Branco',rosa:'Rosa',preto:'Preto',verde:'Verde',azul:'Azul',lilas:'Lilás',laranja:'Laranja',cafe:'Café',natal:'Natal',custom:'Personalizado'};
  if(tn) tn.textContent=nomes[t]||t;
  // Preencher mensagens
  var defCob='Olá, {nome}! 😊\n\nAqui é a *Bela Modas*! 👗\n\nPassando para lembrar que você tem um crediário em aberto de *{saldo}* há {dias} dias.\n\nQuando puder, entre em contato! 💕\n\n📞 31 99733-7304';
  var defComp='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Comprovante de Venda*\n{itens}\n\n💰 *Total: {total}*\nPagamento: {forma}\n\nObrigada pela preferência! 💕\n📞 31 99733-7304';
  var mc=document.getElementById('cfg-msg-cob');
  if(mc) mc.value=getCfg('msgCob')||defCob;
  var mp=document.getElementById('cfg-msg-comp');
  if(mp) mp.value=getCfg('msgComp')||defComp;
  var defPag='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Recibo de Pagamento*\nValor pago: *{valor}*\nForma: {forma}\nData: {data}\n\nObrigada! 💕\n📞 31 99733-7304';
  var mpg=document.getElementById('cfg-msg-pag');
  if(mpg) mpg.value=getCfg('msgPag')||defPag;
  // Preencher pickers de cor personalizada
  var tema=TEMAS[t]||TEMAS['vinho'];
  var bg=document.getElementById('cfg-cor-bg');
  var ac=document.getElementById('cfg-cor-accent');
  var sb=document.getElementById('cfg-cor-sb');
  if(bg) bg.value=tema['--bg']||'#f5f0f2';
  if(ac) ac.value=tema['--red']||'#9c1b3e';
  try {
    var sbMatch=(tema['--sb-bg']||'').match(/#[0-9a-fA-F]{6}/);
    if(sb && sbMatch) sb.value=sbMatch[0];
  } catch(e){}
}

;

function aplicarTema(nome){
  if(!TEMAS||!TEMAS[nome])return;
  var t=TEMAS[nome];
  var root=document.documentElement;
  Object.keys(t).forEach(function(k){
    if(k==='--sb-bg') return;
    root.style.setProperty(k,t[k]);
  });
  var sb=document.getElementById('sb');
  if(sb&&t['--sb-bg'])sb.style.background=t['--sb-bg'];
  try{
    var obj=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    obj.tema=nome; localStorage.setItem('bm_cfg_obj',JSON.stringify(obj));
  }catch(e){}
}

function carregarTema(){
  try{
    var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    var t=o.tema||'vinho';
    // Restaurar tema custom se salvo
    if(t==='custom' && o.temaCustom){
      TEMAS['custom']=o.temaCustom;
    }
    aplicarTema(t);
  }catch(e){ aplicarTema('vinho'); }
}

function irConfig(){
  ir('config');
  // Carregar valores atuais
  var cfg=getCfg();
  document.getElementById('cfg-msg-cob').value=cfg.msgCob;
  document.getElementById('cfg-msg-comp').value=cfg.msgComp||'';
  var _mpg=document.getElementById('cfg-msg-pag'); if(_mpg) _mpg.value=cfg.msgPag||'';
  // Highlight tema atual
  var t=localStorage.getItem('bm_tema')||'vinho';
  document.querySelectorAll('.tema-card').forEach(function(c){c.style.borderColor='var(--bdr)';c.style.background='';});
  var tc=document.getElementById('tema-'+t);
  if(tc){tc.style.borderColor='var(--red2)';tc.style.background='var(--s2)';}
}

function getCfg(k,def){
  try{
    var obj=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    if(k===undefined) return obj;
    if(obj[k]!==undefined) return obj[k];
  }catch(e){}
  return (def!==undefined)?def:null;
}
function setCfgObj(k,v){
  try{
    var obj=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    obj[k]=v; localStorage.setItem('bm_cfg_obj',JSON.stringify(obj));
  }catch(e){}
}

function salvarSenha(){
  var atual=document.getElementById('cfg-s-atual').value;
  var nova=document.getElementById('cfg-s-nova').value;
  var conf=document.getElementById('cfg-s-conf').value;
  var cfg=getCfg();
  if((atual||'').trim()!==getAdmSenhaAtual()){toast('❌ Senha atual incorreta!');return;}
  if(!nova){toast('⚠️ Digite a nova senha!');return;}
  if(nova!==conf){toast('❌ As senhas não coincidem!');return;}
  salvarAdmSenha(nova);
  document.getElementById('cfg-s-atual').value='';
  document.getElementById('cfg-s-nova').value='';
  document.getElementById('cfg-s-conf').value='';
  toast('✅ Senha alterada com sucesso!','ok');
}





// ── EDIÇÃO COM SENHA ──
var _senhaCallback=null;
var ADM_SENHA='Adm1234';

var SENHA_PADRAO_ADM='Adm1234';
var SENHA_RECUPERACAO='Bela3001';

function restaurarSenhaPadrao(){
  try{
    localStorage.setItem('adm_senha', SENHA_PADRAO_ADM);

    var cfg1=JSON.parse(localStorage.getItem('bm_cfg')||'{}');
    cfg1.senha=SENHA_PADRAO_ADM;
    localStorage.setItem('bm_cfg', JSON.stringify(cfg1));

    var cfg2=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    cfg2.senha=SENHA_PADRAO_ADM;
    localStorage.setItem('bm_cfg_obj', JSON.stringify(cfg2));

    if(typeof ADM_SENHA!=='undefined') window.ADM_SENHA=SENHA_PADRAO_ADM;
  }catch(e){}
}

function getAdmSenhaAtual(){
  try{
    var cfg2=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    if(cfg2 && cfg2.senha) return cfg2.senha;
  }catch(e){}
  try{
    var cfg1=JSON.parse(localStorage.getItem('bm_cfg')||'{}');
    if(cfg1 && cfg1.senha) return cfg1.senha;
  }catch(e){}
  return localStorage.getItem('adm_senha') || SENHA_PADRAO_ADM;
}

function salvarAdmSenha(n){
  localStorage.setItem('adm_senha', n);
  try{
    var cfg1=JSON.parse(localStorage.getItem('bm_cfg')||'{}');
    cfg1.senha=n;
    localStorage.setItem('bm_cfg', JSON.stringify(cfg1));
  }catch(e){}
  try{
    var cfg2=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    cfg2.senha=n;
    localStorage.setItem('bm_cfg_obj', JSON.stringify(cfg2));
  }catch(e){}
  if(typeof ADM_SENHA!=='undefined') window.ADM_SENHA=n;
}

function abrirRecSenha(){
  var m=document.getElementById('mo-rec-senha');
  if(!m)return;
  document.body.appendChild(m);
  m.classList.add('on');
  var er=document.getElementById('rec-erro');
  if(er){er.style.display='none';er.textContent='';}
  ['rec-chave','rec-nova','rec-conf'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  setTimeout(function(){
    var i=document.getElementById('rec-chave');
    if(i)i.focus();
  },120);
}

function fecharRecSenha(){
  var m=document.getElementById('mo-rec-senha');
  if(m)m.classList.remove('on');
}

function confirmarRecSenha(){
  var k=(document.getElementById('rec-chave')||{}).value||'';
  var n=(document.getElementById('rec-nova')||{}).value||'';
  var c=(document.getElementById('rec-conf')||{}).value||'';
  var er=document.getElementById('rec-erro');
  function show(msg){
    if(er){er.textContent=msg;er.style.display='block';}
    else alert(msg);
  }
  if(k!==SENHA_RECUPERACAO){show('Senha de recuperação inválida!');return;}
  if(!n || n.length<4){show('Digite uma nova senha com pelo menos 4 caracteres.');return;}
  if(n!==c){show('A confirmação da nova senha não confere.');return;}
  salvarAdmSenha(n);
  fecharRecSenha();
  var ms=document.getElementById('mo-senha');
  if(ms)ms.classList.remove('on');
  alert('Senha alterada com sucesso!');
}

// Senha não deve ser restaurada automaticamente ao abrir o sistema.
// A função restaurarSenhaPadrao() continua disponível apenas para uso manual/recuperação.

function pedirSenha(callback){
  _senhaCallback=callback;
  var i=document.getElementById('adm-senha');
  var e=document.getElementById('adm-erro');
  if(i)i.value='';
  if(e)e.style.display='none';
  var ms=document.getElementById('mo-senha');
  if(ms){
    document.body.appendChild(ms);
    ms.classList.add('on');
  }else{
    abrirMd('mo-senha');
  }
  setTimeout(function(){
    var x=document.getElementById('adm-senha');
    if(x)x.focus();
  },200);
}
function confirmarSenha(){
  var s=document.getElementById('adm-senha').value;
  if((s||'').trim()===getAdmSenhaAtual()){
    fMd('mo-senha');
    if(_senhaCallback)_senhaCallback();
  } else {
    document.getElementById('adm-erro').style.display='block';
    document.getElementById('adm-senha').value='';
    document.getElementById('adm-senha').focus();
  }
}

// Editar Venda
function abrirEditVenda(id){
  pedirSenha(function(){
    var v=DB.get('vendas').find(function(x){return x.id===id;});if(!v)return;
    document.getElementById('ev-id').value=v.id;
    document.getElementById('ev-cli').value=v.cliNome;
    document.getElementById('ev-forma').value=v.forma;
    document.getElementById('ev-total').value=v.total.toFixed(2);
    abrirMd('mo-edit-venda');
  });
}
function salvarEditVenda(){
  var id=document.getElementById('ev-id').value;
  var vendas=DB.get('vendas');
  var idx=vendas.findIndex(function(v){return v.id===id;});if(idx<0)return;
  vendas[idx].cliNome=document.getElementById('ev-cli').value;
  vendas[idx].forma=document.getElementById('ev-forma').value;
  vendas[idx].total=parseFloat(document.getElementById('ev-total').value);
  DB.set('vendas',vendas);fMd('mo-edit-venda');
  renderCaixa();renderRel();renderDash();
  toast('✅ Venda atualizada!','ok');
}

// Editar Pagamento
function abrirEditPag(id){
  pedirSenha(function(){
    var p=DB.get('pagamentos').find(function(x){return x.id===id;});if(!p)return;
    document.getElementById('ep-id').value=p.id;
    document.getElementById('ep-val').value=p.val.toFixed(2);
    document.getElementById('ep-forma').value=p.forma;
    document.getElementById('ep-obs').value=p.obs||'';
    abrirMd('mo-edit-pag');
  });
}
function salvarEditPag(){
  var id=document.getElementById('ep-id').value;
  var pgs=DB.get('pagamentos');
  var idx=pgs.findIndex(function(p){return p.id===id;});if(idx<0)return;
  pgs[idx].val=parseFloat(document.getElementById('ep-val').value);
  pgs[idx].forma=document.getElementById('ep-forma').value;
  pgs[idx].obs=document.getElementById('ep-obs').value;
  DB.set('pagamentos',pgs);fMd('mo-edit-pag');
  if(typeof renderRecebPainel==='function')renderRecebPainel();
  renderCaixa();renderDash();
  toast('✅ Pagamento atualizado!','ok');
}


// ── HISTÓRICO DE VENDAS ──
function renderVendas(){
  var busca=(document.getElementById('vs-busca')||{value:''}).value.toLowerCase();
  var data=(document.getElementById('vs-data')||{value:''}).value;
  var vendas=DB.get('vendas').slice().reverse();
  if(busca) vendas=vendas.filter(function(v){return (v.cliNome||'').toLowerCase().includes(busca);});
  if(data)  vendas=vendas.filter(function(v){return v.data&&v.data.startsWith(data);});

  var total=vendas.reduce(function(s,v){return s+v.total;},0);
  var st=document.getElementById('vs-st');
  if(st) st.innerHTML=
    '<div class="st stg"><div class="sl">Vendas</div><div class="sv">'+vendas.length+'</div></div>'+
    '<div class="st str"><div class="sl">Total</div><div class="sv">'+R(total)+'</div></div>';

  var rows=vendas.map(function(v){
    var vid=v.id;
    var itensResumo=v.itens?v.itens.map(function(i){return i.desc;}).join(', '):'—';
    if(itensResumo.length>40) itensResumo=itensResumo.substr(0,40)+'...';
    return '<tr>'+
      '<td>'+FDT(v.data)+'</td>'+
      '<td><b>'+v.cliNome+'</b>'+nfceBadgeHTML(v, false)+'</td>'+
      '<td style="font-size:12px;color:var(--txt2);">'+itensResumo+'</td>'+
      '<td>'+textoPagamentosVenda(v)+'</td>'+
      '<td style="font-weight:800;color:var(--red2);">'+R(v.total)+'</td>'+
      '<td><button class="btn bh xs" onclick="abrirVdet(\''+vid+'\')">🔍 Ver</button></td>'+
    '</tr>';
  }).join('');
  var tb=document.getElementById('vs-tb');
  if(tb) tb.innerHTML=rows||'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--txt2);">Nenhuma venda encontrada</td></tr>';
}


function fmtInputDateTime(v){
  if(!v) return '';
  try{
    var d=new Date(v);
    if(isNaN(d.getTime())) return '';
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  }catch(e){ return ''; }
}
function parseInputDateTime(v,fallback){
  if(!v) return fallback || nowLocalISO();
  try{
    var d=new Date(v);
    if(isNaN(d.getTime())) return fallback || nowLocalISO();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  }catch(e){
    return fallback || nowLocalISO();
  }
}

function vendaPossuiNfceBM(v){
  if(!v) return false;
  try{
    if(typeof nfceStatusInfo === 'function'){
      return nfceStatusInfo(v).classe !== 'sem';
    }
  }catch(e){}
  var raw = String(v.nfce_status || v.status_nfce || v.statusNfce || '').trim();
  return !!(v.nfce_numero || v.nfce_chave || v.nfce_xml_url || v.nfce_pdf_url || raw || v.nfce_protocolo || v.protocolo || v.nProt);
}

function recalcularTotaisVendaBM(v){
  v = v || {};
  var itens = Array.isArray(v.itens) ? v.itens : [];
  var subtotal = itens.reduce(function(s,it){
    return s + (dinheiroNum(it && it.preco) * Number((it && (it.qty || it.qtd || it.quantidade)) || 0));
  }, 0);
  var desconto = dinheiroNum(v.desconto || 0);
  if(desconto > subtotal) desconto = subtotal;
  v.subtotal = subtotal;
  v.desconto = desconto;
  v.total = Math.max(0, subtotal - desconto);
  v.updatedAt = nowLocalISO();
  return v.total;
}

function sincronizarCreditoVendaEditadaBM(v){
  if(!v || !v.id) return;
  var creditos = DB.get('creditos') || [];
  var alterou = false;
  var idx = creditos.findIndex(function(c){ return String(c.vid || '') === String(v.id); });

  if(String(v.forma || '').toLowerCase() === 'fiado'){
    var desc = 'Venda Crediário: ' + ((v.itens || []).map(function(i){ return i.desc || i.nome || 'Item'; }).join(', ') || 'Itens removidos');
    if(idx >= 0){
      creditos[idx].cid = v.cid;
      creditos[idx].cliNome = v.cliNome;
      creditos[idx].desc = desc;
      creditos[idx].val = v.total;
      creditos[idx].data = v.data;
      creditos[idx].updatedAt = nowLocalISO();
    }else{
      creditos.push({id:DB.uid(), cid:v.cid, cliNome:v.cliNome, data:v.data, desc:desc, val:v.total, vid:v.id, createdAt:nowLocalISO(), updatedAt:nowLocalISO()});
    }
    alterou = true;
  }else if(idx >= 0){
    creditos.splice(idx, 1);
    alterou = true;
  }

  if(alterou) DB.set('creditos', creditos);
}

function removerItemVendaSemNfce(vid, itemIndex){
  pedirSenha(function(){
    var vendas = DB.get('vendas') || [];
    var idx = vendas.findIndex(function(x){ return String(x.id) === String(vid); });
    if(idx < 0){ toast('⚠️ Venda não encontrada!'); return; }

    var v = vendas[idx];
    if(vendaPossuiNfceBM(v)){
      toast('⚠️ Venda com NFC-e. Cancele a nota para alterar itens.');
      return;
    }

    var itens = Array.isArray(v.itens) ? v.itens : [];
    var pos = Number(itemIndex);
    if(!isFinite(pos) || pos < 0 || pos >= itens.length){ toast('⚠️ Item não encontrado!'); return; }

    var item = itens[pos];
    var valorItem = dinheiroNum(item.preco) * Number(item.qty || item.qtd || item.quantidade || 0);
    var nomeItem = item.desc || item.nome || 'item';

    if(itens.length <= 1){
      if(!confirm('Esta venda possui apenas este item. Deseja cancelar a venda inteira?')) return;
      cancelarVenda(vid);
      return;
    }

    if(!confirm('Remover \"'+nomeItem+'\" da venda?\n\nValor: '+R(valorItem)+'\nO item voltará para o estoque.')) return;

    itens.splice(pos, 1);
    v.itens = itens;
    ajustarEstoqueVenda([item], 'somar');
    recalcularTotaisVendaBM(v);
    vendas[idx] = v;
    DB.set('vendas', vendas);
    sincronizarCreditoVendaEditadaBM(v);

    try{ limparDebitosOrfaos(); }catch(e){}
    try{ renderProds(); }catch(e){}
    try{ renderPGrid(); }catch(e){}
    try{ renderVendas(); }catch(e){}
    try{ renderCaixa(); }catch(e){}
    try{ renderRel(); }catch(e){}
    try{ renderDash(); }catch(e){}
    abrirVdet(vid);
    toast('✅ Item removido da venda!','ok');
  });
}

function abrirVdet(vid){
  var vendas=DB.get('vendas');
  var v=vendas.find(function(x){return x.id===vid;});
  if(!v) return;
  fMd('mo-cx-vendas');
  document.getElementById('vdet-id').value=vid;
  document.getElementById('vdet-cli').textContent=v.cliNome||'Balcão';
  document.getElementById('vdet-data').value=fmtInputDateTime(v.data);
  document.getElementById('vdet-total').textContent=R(v.total);
  var sel=document.getElementById('vdet-forma');
  if(sel) sel.value=v.forma||'dinheiro';
  var permiteRemover = !vendaPossuiNfceBM(v);
  var rows=(v.itens||[]).map(function(it,idx){
    var acao = permiteRemover
      ? '<button class="btn bd2 xs" onclick="removerItemVendaSemNfce(\''+vid+'\','+idx+')" title="Remover item da venda">🗑️</button>'
      : '<span class="tm" title="Venda com NFC-e: não permite alterar itens">NFC-e</span>';
    return '<tr>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);">'+it.desc+'</td>'+
      '<td style="padding:8px 6px;text-align:center;border-bottom:1px solid var(--bdr);">'+it.qty+'</td>'+
      '<td style="padding:8px 6px;text-align:right;border-bottom:1px solid var(--bdr);">'+R(it.preco)+'</td>'+
      '<td style="padding:8px 6px;text-align:right;border-bottom:1px solid var(--bdr);font-weight:700;">'+R(it.preco*it.qty)+'</td>'+
      '<td style="padding:8px 6px;text-align:center;border-bottom:1px solid var(--bdr);">'+acao+'</td>'+
    '</tr>';
  }).join('');
  document.getElementById('vdet-itens').innerHTML=rows;
  abrirMd('mo-vdet');
}

function salvarEdicaoVenda(){
  pedirSenha(function(){
    var vid=document.getElementById('vdet-id').value;
    var forma=document.getElementById('vdet-forma').value;
    var vendas=DB.get('vendas');
    var idx=vendas.findIndex(function(x){return x.id===vid;});
    if(idx<0){toast('⚠️ Venda não encontrada!');return;}
    var formaAnterior=vendas[idx].forma||'dinheiro';
    var novaData=parseInputDateTime(document.getElementById('vdet-data').value, vendas[idx].data||nowLocalISO());

    vendas[idx].forma=forma;
    vendas[idx].data=novaData;
    DB.set('vendas',vendas);

    var creditos=DB.get('creditos')||[];
    var cidx=creditos.findIndex(function(c){return String(c.vid||'')===String(vid);});

    if(forma==='fiado'){
      if(cidx>=0){
        creditos[cidx].data=novaData;
        creditos[cidx].val=vendas[idx].total;
        creditos[cidx].cliNome=vendas[idx].cliNome;
        creditos[cidx].cid=vendas[idx].cid;
      }else{
        creditos.push({
          id: DB.uid(),
          vid: vid,
          cid: vendas[idx].cid,
          cliNome: vendas[idx].cliNome,
          val: vendas[idx].total,
          data: novaData
        });
      }
      DB.set('creditos',creditos);
    }else if(formaAnterior==='fiado' && forma!=='fiado'){
      DB.set('creditos',creditos.filter(function(c){return String(c.vid||'')!==String(vid);}));
    }else if(cidx>=0){
      creditos[cidx].data=novaData;
      DB.set('creditos',creditos);
    }

    fMd('mo-vdet');
    renderVendas();
    renderCaixa();
    renderRel();
    renderDash();
    toast('✅ Venda atualizada!','ok');
  });
}

function pedirSenhaCancelar(){
  var vid=document.getElementById('vdet-id').value;
  pedirSenha(function(){ cancelarVenda(vid); });
}

function cancelarVenda(vid){
  var vendas=DB.get('vendas');
  var v=vendas.find(function(x){return x.id===vid;});
  if(!v){toast('⚠️ Venda não encontrada!');return;}
  if(!confirm('Cancelar venda de '+R(v.total)+' de '+v.cliNome+'?\nEsta ação não pode ser desfeita!')){return;}

  ajustarEstoqueVenda(v.itens || [], 'somar');

  var creditosRem = (DB.get('creditos')||[]).filter(function(c){ return String(c.vid||'')===String(vid); });
  var fiadosRem = Array.isArray(DB.get('fiados')) ? (DB.get('fiados')||[]).filter(function(f){ return String(f.vid||'')===String(vid); }) : [];
  var pagamentosRem = (DB.get('pagamentos')||[]).filter(function(p){
    var pvid=String(p.vid || p.venda_id || '');
    return pvid===String(vid);
  });

  registrarDeletedStore('vendas', v);
  registrarDeletedLote('creditos', creditosRem);
  registrarDeletedLote('creditos', fiadosRem);
  registrarDeletedLote('pagamentos', pagamentosRem);

  DB.set('vendas', vendas.filter(function(x){return x.id!==vid;}));
  DB.set('creditos', (DB.get('creditos')||[]).filter(function(c){ return String(c.vid||'')!==String(vid); }));
  if(Array.isArray(DB.get('fiados'))){
    DB.set('fiados', (DB.get('fiados')||[]).filter(function(f){ return String(f.vid||'')!==String(vid); }));
  }
  DB.set('pagamentos', (DB.get('pagamentos')||[]).filter(function(p){
    var pvid=String(p.vid || p.venda_id || '');
    return pvid!==String(vid);
  }));

  limparDebitosOrfaos();

  fMd('mo-vdet');
  try{renderProds();}catch(e){}
  try{renderPGrid();}catch(e){}
  try{renderCaixa();}catch(e){}
  try{renderCrediario();}catch(e){}
  try{renderRecebPainel();}catch(e){}
  try{renderCobranca();}catch(e){}
  try{renderVendas();}catch(e){}
  try{renderDash();}catch(e){}
  toast('🚫 Venda cancelada!','ok');
}

function printVdet(){
  var vid=document.getElementById('vdet-id').value;
  var vendas=DB.get('vendas');
  var v=vendas.find(function(x){return x.id===vid;});
  if(!v) return;
  var clis=DB.get('clientes');
  var cli=clis.find(function(x){return x.id===v.cid;})||{nome:v.cliNome||'Balcão'};
  mostrarComp(v,cli,null);
}

// ── CONFIGURAÇÕES - MODAIS ──
function abrirCfgMsgs(){
  var cfg=getCfg();
  var defCob='Olá, {nome}! 😊\n\nAqui é a *Bela Modas*! 👗\n\nPassando para lembrar que você tem um crediário em aberto de *{saldo}* há {dias} dias.\n\nQuando puder, entre em contato para regularizarmos! 💕\n\n📞 31 99733-7304\n📍 @bela_modaspetro';
  var defComp='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Comprovante de Venda*\n{itens}\n\n💰 *Total: {total}*\nPagamento: {forma}\n\nObrigada pela preferência! 💕\n📞 31 99733-7304';
  var el1=document.getElementById('cfg-msg-cob');
  var el2=document.getElementById('cfg-msg-comp');
  var defPag='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Recibo de Pagamento*\nValor pago: *{valor}*\nForma: {forma}\nData: {data}\n\nObrigada! 💕\n📞 31 99733-7304';
  var el3=document.getElementById('cfg-msg-pag');
  if(el1) el1.value=(cfg&&cfg.msgCob)||defCob;
  if(el2) el2.value=(cfg&&cfg.msgComp)||defComp;
  if(el3) el3.value=(cfg&&cfg.msgPag)||defPag;
  abrirMd('mo-cfg-msgs');
}

function salvarMsgsCfg(){
  try{
    var obj=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    var el1=document.getElementById('cfg-msg-cob');
    var el2=document.getElementById('cfg-msg-comp');
    var el3=document.getElementById('cfg-msg-pag');
    if(el1) obj.msgCob=el1.value;
    if(el2) obj.msgComp=el2.value;
    if(el3) obj.msgPag=el3.value;
    localStorage.setItem('bm_cfg_obj',JSON.stringify(obj));
    fMd('mo-cfg-msgs');
    toast('✅ Mensagens salvas!','ok');
  }catch(e){toast('❌ Erro ao salvar!');}
}

function abrirCfgTema(){
  var t=getCfg('tema')||'vinho';
  document.querySelectorAll('.tema-card').forEach(function(c){
    c.style.borderColor='var(--bdr)'; c.style.boxShadow='none';
    c.style.transform='';
  });
  var tc=document.getElementById('tema-'+t);
  if(tc){tc.style.borderColor='var(--red2)';tc.style.boxShadow='0 0 0 3px rgba(192,57,43,.25)';}
  abrirMd('mo-cfg-tema');
}

function abrirCfgSenha(){
  ['cfg-s-atual','cfg-s-nova','cfg-s-conf'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var err=document.getElementById('cfg-s-erro');
  if(err){err.style.display='none'; err.textContent='';}
  abrirMd('mo-cfg-senha');
}

function salvarSenhaCfg(){
  var atual=(document.getElementById('cfg-s-atual')||{value:''}).value;
  var nova=(document.getElementById('cfg-s-nova')||{value:''}).value;
  var conf=(document.getElementById('cfg-s-conf')||{value:''}).value;
  var err=document.getElementById('cfg-s-erro');
  function showErr(msg){if(err){err.textContent=msg;err.style.display='block';}}
  try{
    var obj=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    var senhaAtual=getAdmSenhaAtual();
    if((atual||'').trim()!==senhaAtual){showErr('❌ Senha atual incorreta!');return;}
    if(nova.length<4){showErr('⚠️ Nova senha deve ter pelo menos 4 caracteres!');return;}
    if(nova!==conf){showErr('❌ As senhas não coincidem!');return;}
    salvarAdmSenha(nova);
    if(err) err.style.display='none';
    fMd('mo-cfg-senha');
    toast('✅ Senha alterada com sucesso!','ok');
  }catch(e){showErr('❌ Erro ao salvar!');}
}

// Override getCfg para suportar objeto completo

// Override wppCobrar para usar msgCob do cfg

// Registrar ir('vendas') no switch






function verVendasCaixa(tipo){
  var data=document.getElementById('cx-d').value; if(!data)return;
  var vendas=DB.get('vendas').filter(function(v){
    return v.data.startsWith(data) && (tipo==='vista'?v.forma!=='fiado':v.forma==='fiado');
  });
  var titulo=tipo==='vista'?'🛍️ Vendas à Vista — '+data:'💳 Crediário — '+data;
  var rows=vendas.map(function(v){
    return '<tr>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);">'+
        new Date(v.data).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+
      '</td>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);"><b>'+v.cliNome+'</b></td>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);">'+textoPagamentosVenda(v)+'</td>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);font-weight:800;color:var(--red2);text-align:right;">'+R(v.total)+'</td>'+
      '<td style="padding:8px 6px;border-bottom:1px solid var(--bdr);">'+
        '<span style="display:flex;gap:5px;">'+
          '<button class="btn bh xs" onclick="abrirVdet(\''+v.id+'\')" style="padding:5px 9px;" title="Ver/Editar">🔍 Ver</button>'+
          '<button class="btn bd2 xs" onclick="pedirSenhaECancelar(\''+v.id+'\')" style="padding:5px 9px;" title="Cancelar">🚫</button>'+
        '</span>'+
      '</td>'+
    '</tr>';
  }).join('');

  var total=vendas.reduce(function(s,v){return s+v.total;},0);

  document.getElementById('mo-cx-vendas-t').textContent=titulo;
  document.getElementById('mo-cx-vendas-tb').innerHTML=rows||
    '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--txt2);">Nenhuma venda</td></tr>';
  document.getElementById('mo-cx-vendas-total').textContent='Total: '+R(total)+' ('+vendas.length+' venda(s))';
  abrirMd('mo-cx-vendas');
}

function pedirSenhaECancelar(vid){
  pedirSenha(function(){
    cancelarVenda(vid);
    try{fMd('mo-cx-vendas');}catch(e){}
  });
}



var _TEMAS_NOMES_CFG={escuro:'Escuro',claro:'Cinza',branco:'Branco',rosa:'Rosa',vinho:'Vinho',preto:'Preto'};













function abrirFormaPag(){
  // F10: abre modal de seleção de forma de pagamento na venda ativa
  var pg=document.querySelector('.pg.on');
  if(pg && pg.id==='pg-venda'){
    // Destaca o select de forma de pagamento
    var sel=document.getElementById('v-forma');
    if(sel){sel.focus(); sel.style.outline='3px solid #2980b9'; setTimeout(function(){sel.style.outline='';},1500);}
    hlFk('F10');
  } else {
    // Vai para nova venda e foca no forma de pagamento
    ir('venda');
    setTimeout(function(){
      var sel=document.getElementById('v-forma');
      if(sel){sel.focus(); sel.style.outline='3px solid #2980b9'; setTimeout(function(){sel.style.outline='';},1500);}
    },200);
    hlFk('F10');
  }
}




var _NOMES_TEMA={vinho:'Vinho',escuro:'Escuro',claro:'Cinza',branco:'Branco',rosa:'Rosa',preto:'Preto'};

function aplicarTemaCfg(nome){
  aplicarTema(nome);
  document.querySelectorAll('.tema-card').forEach(function(c){
    c.style.outline='none'; c.style.transform='scale(1)';
  });
  var sel=document.querySelector('[data-tema="'+nome+'"]');
  if(sel){sel.style.outline='3px solid #c0392b'; sel.style.transform='scale(1.06)';}
  var tn=document.getElementById('tema-atual-nome');
  if(tn) tn.textContent=_NOMES_TEMA[nome]||nome;
  toast('🎨 Tema '+(_NOMES_TEMA[nome]||nome)+' aplicado!','ok');
}

function salvarMsgCob(){
  var e=document.getElementById('cfg-msg-cob'); if(!e)return;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgCob=e.value; localStorage.setItem('bm_cfg_obj',JSON.stringify(o)); toast('✅ Mensagem de cobrança salva!','ok');}catch(ex){toast('❌ Erro!');}
}
function resetMsgCob(){
  var d='Olá, {nome}! 😊\n\nAqui é a *Bela Modas*! 👗\n\nPassando para lembrar que você tem um crediário em aberto de *{saldo}* há {dias} dias.\n\nQuando puder, entre em contato! 💕\n\n📞 31 99733-7304';
  var e=document.getElementById('cfg-msg-cob'); if(e)e.value=d;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgCob=d; localStorage.setItem('bm_cfg_obj',JSON.stringify(o));}catch(ex){}
  toast('↩️ Restaurado!','ok');
}
function salvarMsgComp(){
  var e=document.getElementById('cfg-msg-comp'); if(!e)return;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgComp=e.value; localStorage.setItem('bm_cfg_obj',JSON.stringify(o)); toast('✅ Mensagem de comprovante salva!','ok');}catch(ex){toast('❌ Erro!');}
}
function resetMsgComp(){
  var d='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Comprovante de Venda*\n{itens}\n\n💰 *Total: {total}*\nPagamento: {forma}\n\nObrigada pela preferência! 💕\n📞 31 99733-7304';
  var e=document.getElementById('cfg-msg-comp'); if(e)e.value=d;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgComp=d; localStorage.setItem('bm_cfg_obj',JSON.stringify(o));}catch(ex){}
  toast('↩️ Restaurado!','ok');
}
function salvarMsgPag(){
  var e=document.getElementById('cfg-msg-pag'); if(!e)return;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgPag=e.value; localStorage.setItem('bm_cfg_obj',JSON.stringify(o)); toast('✅ Mensagem de recibo salva!','ok');}catch(ex){toast('❌ Erro!');}
}
function resetMsgPag(){
  var d='👗 *Bela Modas*\n\nOlá, {nome}! 😊\n\n*Recibo de Pagamento*\nValor pago: *{valor}*\nForma: {forma}\nData: {data}\n\nObrigada! 💕\n📞 31 99733-7304';
  var e=document.getElementById('cfg-msg-pag'); if(e)e.value=d;
  try{var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}'); o.msgPag=d; localStorage.setItem('bm_cfg_obj',JSON.stringify(o));}catch(ex){}
  toast('↩️ Restaurado!','ok');
}


function abrirListaCliVenda(){
  filtrarListaCliVenda();
  abrirMd('mo-lista-cli');
  setTimeout(function(){
    var b=document.getElementById('mo-lista-cli-busca');
    if(b){b.value=''; b.focus(); filtrarListaCliVenda();}
  },100);
}

function filtrarListaCliVenda(){
  var q=(document.getElementById('mo-lista-cli-busca')||{value:''}).value.toLowerCase();
  var clis=DB.get('clientes').filter(function(c){
    return !q || c.nome.toLowerCase().includes(q) || (c.cpf||'').includes(q);
  }).sort(function(a,b){return a.nome.localeCompare(b.nome);});

  var container=document.getElementById('mo-lista-cli-items');
  if(!container) return;

  if(!clis.length){
    container.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt2);">Nenhum cliente encontrado</div>';
    return;
  }

  container.innerHTML=clis.map(function(c){
    return '<div onclick="selecionarCliVenda(\''+c.id+'\')" style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid var(--bdr);cursor:pointer;border-radius:8px;transition:background .15s;" '+
      'onmouseenter="this.style.background=\'var(--s2)\'" onmouseleave="this.style.background=\'\'">'+
      '<div>'+
        '<div style="font-weight:800;font-size:14px;color:var(--txt);">'+c.nome+'</div>'+
        '<div style="font-size:12px;color:var(--txt2);">'+(c.cpf||'')+(c.tel?' · '+c.tel:'')+'</div>'+
      '</div>'+
      '<span style="font-size:20px;">▶</span>'+
    '</div>';
  }).join('');
}

function selecionarCliVenda(cid){
  selecionarVCli(cid);
  fMd('mo-lista-cli');
  toast('✅ Cliente selecionado!','ok');
}





function aplicarCorPersonalizada(){
  var bg=document.getElementById('cfg-cor-bg');
  var ac=document.getElementById('cfg-cor-accent');
  var sb=document.getElementById('cfg-cor-sb');
  if(!bg||!ac||!sb) return;
  var bgV=bg.value, acV=ac.value, sbV=sb.value;
  // Criar tema custom dinâmico
  TEMAS['custom']={
    '--bg':bgV,'--s1':lighten(bgV,15),'--s2':lighten(bgV,8),
    '--txt':darken(bgV,70),'--txt2':darken(bgV,40),
    '--bdr':lighten(acV,40),'--red':acV,'--red2':darken(acV,10),
    '--green':'#27ae60','--blue':'#2980b9','--gold':acV,
    '--glow':hexToRgba(acV,.15),
    '--sb-bg':'linear-gradient(180deg,'+sbV+','+darken(sbV,20)+')'
  };
  aplicarTema('custom');
  document.querySelectorAll('.tema-card').forEach(function(c){c.style.outline='none';c.style.transform='scale(1)';});
  var tn=document.getElementById('tema-atual-nome');
  if(tn) tn.textContent='Personalizado';
  toast('🎨 Cor personalizada aplicada!','ok');
}
function salvarCorPersonalizada(){
  aplicarCorPersonalizada();
  try{
    var o=JSON.parse(localStorage.getItem('bm_cfg_obj')||'{}');
    o.tema='custom';
    o.temaCustom=TEMAS['custom'];
    localStorage.setItem('bm_cfg_obj',JSON.stringify(o));
    toast('💾 Cor personalizada salva!','ok');
  }catch(e){toast('❌ Erro ao salvar','err');}
}
function lighten(hex,pct){
  try{var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,r+Math.round(pct*2.55));g=Math.min(255,g+Math.round(pct*2.55));b=Math.min(255,b+Math.round(pct*2.55));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}catch(e){return hex;}
}
function darken(hex,pct){
  try{var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  r=Math.max(0,r-Math.round(pct*2.55));g=Math.max(0,g-Math.round(pct*2.55));b=Math.max(0,b-Math.round(pct*2.55));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}catch(e){return hex;}
}
function hexToRgba(hex,a){
  try{var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+a+')';}catch(e){return 'rgba(0,0,0,'+a+')';}
}









setTimeout(function(){ try{ startSyncLoop(); }catch(e){} }, 400);

document.addEventListener('DOMContentLoaded',function(){
  var f=document.getElementById('v-desc');
  if(f){
    f.focus();
    f.addEventListener('keydown',function(e){
      if(e.key==='Enter'){
        var val=this.value.trim();
        if(/^\d{6,}$/.test(val)){
          var p=buscarProdutoPorCodigoOuCodigoBarras(val);
          if(p){
            addProd(p.id);
            this.value='';
            limparBuscaProdutoManual();
            e.preventDefault();
          }
        }
      }
    });
  }
});




document.addEventListener('change', function(e){
  if(e.target && e.target.id === 'prod-cat'){
    atualizarNCMAutomatico();
  }
});
