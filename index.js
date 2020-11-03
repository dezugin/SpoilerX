function leDados () {
    let strDados = localStorage.getItem('db');
    let objDados = {};

    if (strDados) {
        objDados = JSON.parse (strDados);
    }
    else {
        objDados = { cadastro: [ 
                        {userName: "lg", email: "fulano@gmail.com", senha: "1234"}, 
                        {userName: "João da Silva", email: "fulano@gmail.com", senha: "456"}, 
                        {userName: "João da Silva", email: "fulano@gmail.com", senha: "789"} 
                    ]}
    }

    return objDados;
}

function salvaDados (dados) {
    localStorage.setItem ('db', JSON.stringify (dados));
}

function incluirNovoCadastro (){
    // Ler os dados do localStorage
    let objDados = leDados();
    // Incluir um novo contato
    let strUserName = document.getElementById ('campoUserName').value;
    let strEmail= document.getElementById ('cmpoEmail').value;
    let strSenha = document.getElementById ('camposenha').value;
    let novoCadastro = {
        userName: strUserName,
        email: strEmail,
        senha: strSenha
    };
    objDados.cadastro.push (novoCadastro);

    // Salvar os dados no localStorage novamente
    salvaDados (objDados);

    // Atualiza os dados da tela
    imprimeDados ();
}

function imprimeDados () {
    let tela = document.getElementById('tela');
    let strHtml = '';
    let objDados = leDados ();
    console.log("Imprime dados");
    //${} expressao js que e interpretada como string
    for (i=0; i< objDados.cadastro.length; i++) {
        strHtml += `<p>${objDados.cadastro[i].userName} - ${objDados.cadastro[i].email}</p>`
    }

    tela.innerHTML = strHtml;
}





// Configura os botões
document.getElementById ('btnCarregaDados').addEventListener ('click', imprimeDados);
document.getElementById ('btnCadastrar').addEventListener ('click', incluirNovoCadastro);

