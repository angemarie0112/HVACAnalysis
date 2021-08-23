<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // get the data sent in the post request
    $jsData = $_POST['data'];

    // save the file in the dataset folder on this server
    $fp = fopen('ashareAnge.json', 'w');
    fwrite($fp, $jsData);
    fclose($fp);

    echo('Done saving');
}

?>
