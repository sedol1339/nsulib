<?php

	function detect_encoding($file) {

		$possible_encodings = array('windows-1251', 'koi8-r', 'iso8859-5');
		/*
		$data = 'Русская строка';
		$encoding = 'iso8859-5';
		$data = iconv('UTF-8', $encoding, 'Очень длинная русская строка');
		*/

		$data = file_get_contents($file, NULL, NULL, 0, 4096);
		if (strlen($data) < 2)
			return "utf-8";

		/////////////////////////////////////////

		$weights = array();
		$specters = array();
		foreach ($possible_encodings as $encoding)
		{
			$weights[$encoding] = 0;
			$specters[$encoding] = require 'specters/'.$encoding.'.php';
		}

		if(preg_match_all("#(?<let>.{2})#",$data,$matches))
		{
			foreach($matches['let'] as $key)
			{
				foreach ($possible_encodings as $encoding)
				{
					if (isset($specters[$encoding][$key]))
					{
						$weights[$encoding] += $specters[$encoding][$key];
					}
				}
			}
		}

		$sum_weight = array_sum($weights);
		foreach ($weights as $encoding => $weight)
		{
			$weights[$encoding] = $weight / $sum_weight;
		}

		//var_dump($weights);

		/////////////////////////////////////////
		
		$max_weight = max($weights);
		
		if ($max_weight > 0.15) {
			$encoding = array_keys($weights, $max_weight)[0];
			if ($encoding != 'iso8859-5') {
				return $encoding;
			} else {
				return "utf-8";
			}
		} else {
			return "utf-8";
		}
	}

?>