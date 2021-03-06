const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError, InternalServerError } = require("../erros");

const tokens = require("./tokens");

module.exports = {
    async adiciona(req, res) {
        const { nome, email, senha } = req.body;

        try {
            const usuario = new Usuario({
                nome,
                email,
            });

            await usuario.adicionaSenha(senha);

            await usuario.adiciona();

            res.status(201).json();
        } catch (erro) {
            if (erro instanceof InvalidArgumentError) {
                res.status(422).json({ erro: erro.message });
            } else if (erro instanceof InternalServerError) {
                res.status(500).json({ erro: erro.message });
            } else {
                res.status(500).json({ erro: erro.message });
            }
        }
    },

    async login(req, res) {
        try {
            const accessToken = tokens.access.cria(req.user.id);
            const refreshToken = await tokens.refresh.cria(req.user.id);

            res.set("Authorization", accessToken);

            res.status(200).send({ refreshToken });
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    },

    async logout(req, res) {
        try {
            const token = req.token;
            await tokens.access.invalida(token);
            res.status(204).send();
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    },

    async lista(req, res) {
        const usuarios = await Usuario.lista();
        res.json(usuarios);
    },

    async deleta(req, res) {
        const usuario = await Usuario.buscaPorId(req.params.id);
        try {
            await usuario.deleta();
            res.status(200).send();
        } catch (erro) {
            res.status(500).json({ erro: erro });
        }
    },
};
