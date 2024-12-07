// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Escrow Contract
 * @dev Gestión de acuerdos entre comprador, vendedor y árbitro.
 *      Nota: Árbitro global definido temporalmente; mejorar para escalabilidad futura.
 */
contract Escrowdelta { 
    // Estados posibles del pedido
    enum State { AWAITING_DELIVERY, DELIVERED, COMPLETE, REFUNDED }
    // Resoluciones posibles de las disputas
    enum DisputeAction { RELEASE_FUNDS, REFUND, EXTEND_DEADLINE }

    // Estructura de cada pedido de escrow
    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        uint256 deadline;
        uint256 safeDeliveryTime;
        State currentState;
        bool inDispute;
    }

    mapping(uint256 => Escrow) public escrows; // Almacena los pedidos por ID

    uint256 public escrowCount; // Contador para IDs únicos
    address public globalArbiter; // Árbitro global temporal
    uint256 public constant SAFE_TIME = 24 * 60 * 60; // Tiempo seguro de 24 horas en segundos

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
    require(msg.sender == globalArbiter, "Solo el arbitro puede realizar esta accion.");
    _;
    }

    modifier onlyParticipants(uint256 escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(msg.sender == escrow.payer || msg.sender == escrow.payee,"Solo el comprador o el vendedor pueden ejecutar esta accion."
    );
    _;
    }

    modifier onlyPayee(uint256 escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(msg.sender == escrow.payee, "Solo el vendedor puede ejecutar esta accion.");
    _;
    }



    // Crear y fondear un nuevo pedido de escrow
    function createAndDeposit(address _payee, uint256 _deadline) external payable returns (uint256) {
        require(msg.value > 0, "El monto debe ser mayor a cero.");
        require(block.timestamp < _deadline, "Fecha limite invalida.");
        require(_payee != address(0), "Direccion del vendedor invalida.");

        escrowCount++;
        escrows[escrowCount] = Escrow({
            payer: msg.sender,
            payee: _payee,
            amount: msg.value,
            deadline: _deadline,
            safeDeliveryTime: _deadline + SAFE_TIME,
            currentState: State.AWAITING_DELIVERY,
            inDispute: false
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
    escrow.currentState = State.COMPLETE; // Actualiza el estado a COMPLETE  
    payable(escrow.payee).transfer(escrow.amount); // Transfiere los fondos al vendedor

    emit FundsReleased(escrowId, escrow.payee, escrow.amount);   // Emite un evento para registrar la acción
    }

    // Reembolsar los fondos al comprador
    function _refund(uint256 escrowId) internal {
    Escrow storage escrow = escrows[escrowId];
    escrow.currentState = State.REFUNDED; // Actualiza el estado a REFUNDED
    payable(escrow.payer).transfer(escrow.amount);  // Transfiere los fondos al comprador

    emit FundsRefunded(escrowId, escrow.payer, escrow.amount); // Emite un evento para registrar la acción
    }

    // Iniciar Disputas por solo los participantes
    function initiateDispute(uint256 escrowId) external onlyParticipants(escrowId) {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "Estado no apto para iniciar disputa.");
    require(block.timestamp > escrow.deadline,"No se puede iniciar disputa mientras el plazo este en curso.");
    escrow.inDispute = true; // Activa la disputa
    emit DisputeInitiated(escrowId, msg.sender);  // Emite un evento para registrar la disputa
    }

    // Extensión del periodo de tiempo de la transacción
    function extendDeadline(uint256 escrowId, uint256 newDeadline) internal onlyArbiter {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "Estado no apto para extender el plazo.");
    require(newDeadline > escrow.deadline, "La nueva fecha debe ser mayor al plazo actual.");

    escrow.deadline = newDeadline;     // Actualiza el plazo
    emit DeadlineExtended(escrowId, newDeadline);  // Emite un evento para registrar la extensión del plazo
    }

    //Resolucion de disputas por el arbitro

    function resolveDispute(uint256 escrowId, DisputeAction action, uint256 newDeadline) external onlyArbiter {
    Escrow storage escrow = escrows[escrowId];
    require(escrow.inDispute, "No hay una disputa activa para este pedido.");

    if (action == DisputeAction.RELEASE_FUNDS) {
        require(escrow.currentState == State.DELIVERED, "No se Puede Liberar fondos, No se Envio el Producto");
        _releaseFunds(escrowId); //Libera fondos al Vendedor
    } else if (action == DisputeAction.REFUND) {
        require(escrow.currentState == State.AWAITING_DELIVERY || escrow.currentState == State.DELIVERED, "No se Puede Reembolsar, Estado no permitido");
        _refund(escrowId); //Reembolsa fondos al Comprador
    } else if (action == DisputeAction.EXTEND_DEADLINE) {
        extendDeadline(escrowId, newDeadline); //Extiende el periodo de tiempo
    } else {
        revert("Accion invalida para resolver la disputa.");
    }
    emit DisputeResolved(escrowId, msg.sender, uint8(action));
    }


    // Manejar plazos vencidos
    function handleDeadline(uint256 escrowId) external onlyParticipants(escrowId) {
    Escrow storage escrow = escrows[escrowId];

    // Asegurarse de que el pedido no esté en disputa
    require(!escrow.inDispute, "El pedido esta en disputa y no puede manejar plazos.");

    // Caso 1: El comprador ya recibió el producto antes del `deadline`
    if (block.timestamp <= escrow.deadline && escrow.currentState == State.DELIVERED && msg.sender == escrow.payer) {
        _releaseFunds(escrowId); // Liberar los fondos al vendedor
        return;
    }

    // Caso 2: El producto fue enviado, pero el `safeTime` expiró sin disputa
    if (block.timestamp > escrow.deadline && escrow.currentState == State.DELIVERED) {
        if (block.timestamp > escrow.safeDeliveryTime) {
            _releaseFunds(escrowId); // Liberar fondos al vendedor
        } else {
            revert("Aun en periodo para que el comprador inicie una disputa.");
        }
        return;
    }

    // Caso 3: El producto no fue enviado antes del `deadline`
    if (block.timestamp > escrow.deadline && escrow.currentState == State.AWAITING_DELIVERY) {
        _refund(escrowId); // Reembolsar fondos al comprador
        return;
    }

    revert("El pedido ya fue procesado, No se puede ejecutar esta funcion");
    }

}

