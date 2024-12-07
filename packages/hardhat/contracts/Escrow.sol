// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Escrow Contract
 * @dev Gestión de acuerdos entre comprador, vendedor y árbitro.
 *      Nota: Árbitro global definido temporalmente; mejorar para escalabilidad futura.
 */
contract Escrow { 
    // Estados posibles del pedido
    enum State { CREATED, AWAITING_DELIVERY, COMPLETE, REFUNDED }

    // Estructura de cada pedido de escrow
    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        uint256 deadline;
        State currentState;
    }

    mapping(uint256 => Escrow) public escrows; // Almacena los pedidos por ID
    uint256 public escrowCount; // Contador para IDs únicos
    address public globalArbiter; // Árbitro global temporal

    // Constructor
    constructor() {
        globalArbiter = 0x556ffE28AF4661257F299a9a38e81cD937Adbe3f;
    }

    // Eventos
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 deadline
    );

    // Crear y fondear un nuevo pedido de escrow
    function createAndDeposit(address _payee, uint256 _deadline) external payable returns (uint256) {
        require(msg.value > 0, "El monto debe ser mayor a cero.");
        require(block.timestamp < _deadline, "Fecha límite inválida.");
        require(_payee != address(0), "Dirección del vendedor inválida.");

        escrowCount++;
        escrows[escrowCount] = Escrow({
            payer: msg.sender,
            payee: _payee,
            amount: msg.value,
            deadline: _deadline,
            currentState: State.AWAITING_DELIVERY
        });

        emit EscrowCreated(escrowCount, msg.sender, _payee, msg.value, _deadline);
        return escrowCount;
    }

    // Liberar los fondos al vendedor
    function releaseFunds(uint256 escrowId) external {
        // Por implementar
    }

    // Reembolsar los fondos al comprador
    function refund(uint256 escrowId) external {
        // Por implementar
    }

    // Manejar plazos vencidos
    function handleDeadline(uint256 escrowId) external {
        // Por implementar
    }
}
