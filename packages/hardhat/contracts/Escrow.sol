// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Escrow Contract
 * @dev Gestión de acuerdos entre comprador, vendedor y árbitro.
 *      Nota: Árbitro global definido temporalmente; mejorar para escalabilidad futura.
 */
contract Escrow { 
    // Estados posibles del pedido
    enum State { AWAITING_DELIVERY, DELIVERED, COMPLETE, REFUNDED, IN_DISPUTE }

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
    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, uint256 deadline);
    event FundsReleased(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event FundsRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event DisputeInitiated(uint256 indexed escrowId, address indexed initiator);


    // Modificadores
    modifier onlyArbiter() {
    require(msg.sender == globalArbiter, "Solo el árbitro puede realizar esta acción.");
    _;
    }

    modifier onlyParticipants(uint256 escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(msg.sender == escrow.payer || msg.sender == escrow.payee,"Solo el comprador o el vendedor pueden ejecutar esta acción."
    );
    _;
    }


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

    // Marcar el producto como enviado
    function markAsDelivered(uint256 escrowId) external {
    Escrow storage escrow = escrows[escrowId];
    require(msg.sender == escrow.payee, "Solo el vendedor puede marcar como enviado.");
    require(escrow.currentState == State.AWAITING_DELIVERY, "El pedido no está listo para ser marcado como enviado.");

    escrow.currentState = State.DELIVERED;
    }

    // Libera los fondos al vendedor
    function _releaseFunds(uint256 escrowId) internal {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.DELIVERED, "El pedido no se ha enviado.");
    
    escrow.currentState = State.COMPLETE; // Actualiza el estado a COMPLETE  
    
    payable(escrow.payee).transfer(escrow.amount); // Transfiere los fondos al vendedor

    emit FundsReleased(escrowId, escrow.payee, escrow.amount);   // Emite un evento para registrar la acción
    }

    // Reembolsar los fondos al comprador
    function _refund(uint256 escrowId) internal {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "El pedido no está en un estado reembolsable.");

    escrow.currentState = State.REFUNDED; // Actualiza el estado a REFUNDED

    payable(escrow.payer).transfer(escrow.amount);  // Transfiere los fondos al comprador

    emit FundsRefunded(escrowId, escrow.payer, escrow.amount); // Emite un evento para registrar la acción
    }

    function initiateDispute(uint256 escrowId) external onlyParticipants(escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "Estado no apto para iniciar disputa.");

    escrow.currentState = State.IN_DISPUTE; // Cambia el estado a IN_DISPUTE
    emit DisputeInitiated(escrowId, msg.sender);  // Emite un evento para registrar la disputa

    }

    // Manejar plazos vencidos
    function handleDeadline(uint256 escrowId) external {
        // Por implementar
    }
}
