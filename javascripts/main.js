$(function() {
    $("#isoWorldContainer").isoWorldEngine({
        logging: false,
        sound: false,
        cropH: 10,
        cropW: 10,
        fps: 60,
        showObjectBorders: false,
        showTicker: true,
        tmxFilePath: "world/",
        tmxFile: "map.tmx"
    });

    $("#isoWorldContainer").isoWorldEngine.onReady = function() {
        };
    var dx = 0;
    var speed = 5;
    var keyControl = new $.fn.isoWorldEngine.KeyControl();
    $("#tileAndObjectsDummy").css("top", 40);
    $("#isoWorldContainer").isoWorldEngine.update = function() {
        var direction = keyControl.getDirection();
        $.fn.isoWorldEngine.drawText(10, 40, direction);

        switch (direction) {
        case 8:
            dx = 0;
            break;

        case 6:
            dx = speed;
            $("#tileAndObjectsDummy").css("left", parseInt($("#tileAndObjectsDummy").css("left")) - dx);
            break;
        case 0:
            dx = speed;
            $("#tileAndObjectsDummy").css("top", 0 + parseInt($("#tileAndObjectsDummy").css("top")) - dx);
            break;
        case 1:
            dx = speed;
            $("#tileAndObjectsDummy").css({
                left: parseInt($("#tileAndObjectsDummy").css("left")) + dx,
                top: 0 + parseInt($("#tileAndObjectsDummy").css("top")) - dx
            });
            break;
        case 2:
            dx = speed;
            $("#tileAndObjectsDummy").css("left", parseInt($("#tileAndObjectsDummy").css("left")) + dx);
            break;
        case 3:
            dx = speed;
            $("#tileAndObjectsDummy").css({
                left: parseInt($("#tileAndObjectsDummy").css("left")) + dx,
                top: 0 + parseInt($("#tileAndObjectsDummy").css("top")) + dx
            });
            break;
        case 4:
            dx = speed;
            $("#tileAndObjectsDummy").css("top", 0 + parseInt($("#tileAndObjectsDummy").css("top")) + dx);
            break;

        case 5:
            dx = speed;
            $("#tileAndObjectsDummy").css({
                left: parseInt($("#tileAndObjectsDummy").css("left")) - dx,
                top: 0 + parseInt($("#tileAndObjectsDummy").css("top")) + dx
            });
            break;
        case 7:
            dx = speed;
            $("#tileAndObjectsDummy").css({
                left: parseInt($("#tileAndObjectsDummy").css("left")) - dx,
                top: 0 + parseInt($("#tileAndObjectsDummy").css("top")) - dx
            });
            break;

        }
    }
});