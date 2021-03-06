<?php

/*
 * This file is part of Contao Manager.
 *
 * (c) Contao Association
 *
 * @license LGPL-3.0-or-later
 */

namespace Contao\ManagerApi\Task;

use Symfony\Component\Filesystem\Filesystem;

class TaskConfig
{
    /**
     * @var string
     */
    private $file;

    /**
     * @var null|Filesystem
     */
    private $filesystem;

    /**
     * @var array
     */
    private $data;

    /**
     * Constructor.
     *
     * @param string          $file
     * @param null            $name
     * @param array|null      $options
     * @param Filesystem|null $filesystem
     */
    public function __construct($file, $name = null, array $options = null, Filesystem $filesystem = null)
    {
        $this->file = $file;
        $this->filesystem = $filesystem ?: new Filesystem();

        $this->data = [
            'name' => $name,
            'options' => $options,
            'state' => [],
            'cancelled' => false,
        ];

        if (null === $name && null === $options) {
            $this->data = json_decode(file_get_contents($file), true);

            if (!is_array($this->data)) {
                throw new \RuntimeException(sprintf('Invalid task data in file "%s"', $file));
            }
        }
    }

    public function getName()
    {
        return $this->data['name'];
    }

    public function getOptions()
    {
        return $this->data['options'];
    }

    /**
     * @param string $name
     * @param mixed  $default
     *
     * @return mixed
     */
    public function getOption($name, $default = null)
    {
        return array_key_exists($name, $this->data['options']) ? $this->data['options'][$name] : $default;
    }

    public function getState($name, $default = null)
    {
        return array_key_exists($name, $this->data['state']) ? $this->data['state'][$name] : $default;
    }

    public function setState($name, $value)
    {
        $this->data['state'][$name] = $value;

        $this->save();
    }

    public function clearState($name)
    {
        unset($this->data['state'][$name]);
    }

    /**
     * @return bool
     */
    public function isCancelled()
    {
        return $this->data['cancelled'];
    }

    /**
     * Mark task as cancelled.
     */
    public function setCancelled()
    {
        $this->data['cancelled'] = true;

        $this->save();
    }

    public function save()
    {
        file_put_contents(
            $this->file,
            json_encode($this->data),
            LOCK_EX
        );
    }

    public function delete()
    {
        $this->filesystem->remove($this->file);
    }
}
