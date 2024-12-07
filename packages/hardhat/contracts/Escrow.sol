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
    // Resoluciones posibles de las disputas
    enum DisputeAction { RELEASE_FUNDS, REFUND, EXTEND_DEADLINE }

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
    event OrderMarkedAsDelivered(uint256 indexed escrowId, address indexed seller);
    event FundsReleased(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event FundsRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event DisputeInitiated(uint256 indexed escrowId, address indexed initiator);
    event DeadlineExtended(uint256 indexed escrowId, uint256 newDeadline);
    event DisputeResolved(uint256 indexed escrowId, address indexed resolver, uint8 action);




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

    modifier onlyPayee(uint256 escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(msg.sender == escrow.payee, "Solo el vendedor puede ejecutar esta acción.");
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
    function markAsDelivered(uint256 escrowId) external onlyPayee(escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY, "El estado del pedido no es para ser enviado");

    escrow.currentState = State.DELIVERED;    // Cambia el estado a DELIVERED
    emit OrderMarkedAsDelivered(escrowId, msg.sender); // Opción: Podrías emitir un evento aquí
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

    // Iniciar Disputas por solo los participantes
    function initiateDispute(uint256 escrowId) external onlyParticipants(escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "Estado no apto para iniciar disputa.");

    escrow.currentState = State.IN_DISPUTE; // Cambia el estado a IN_DISPUTE
    emit DisputeInitiated(escrowId, msg.sender);  // Emite un evento para registrar la disputa
    }

    // Extensión del periodo de tiempo de la transacción
    function extendDeadline(uint256 escrowId, uint256 newDeadline) external onlyArbiter {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "Estado no apto para extender el plazo.");
    require(newDeadline > escrow.deadline, "La nueva fecha debe ser mayor al plazo actual.");

    escrow.deadline = newDeadline;     // Actualiza el plazo
    emit DeadlineExtended(escrowId, newDeadline);  // Emite un evento para registrar la extensión del plazo
    }

    //Resolucion de disputas por el arbitro

    function resolveDispute(uint256 escrowId, DisputeAction action, uint256 newDeadline) external onlyArbiter {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.IN_DISPUTE, "No hay una disputa activa para este pedido.");

    if (action == DisputeAction.RELEASE_FUNDS) {
        _releaseFunds(escrowId); //Libera fondos al Vendedor
    } else if (action == DisputeAction.REFUND) {
        _refund(escrowId); //Reembolsa fondos al Comprador
    } else if (action == DisputeAction.EXTEND_DEADLINE) {
        _extendDeadline(escrowId, newDeadline); //Extiende el periodo de tiempo
    } else {
        revert("Acción inválida para resolver la disputa.");
    }
    emit DisputeResolved(escrowId, msg.sender, uint8(action));
    }


    // Manejar plazos vencidos
    function handleDeadline(uint256 escrowId) external {
        // Por implementar
    }
}
